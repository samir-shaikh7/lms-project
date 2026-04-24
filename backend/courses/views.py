import razorpay
import io
from django.conf import settings
from django.http import FileResponse
from django.db.models import Sum, Avg, Count
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course, Enrollment, Lesson, LessonProgress, Payment
from .serializers import CourseSerializer, LessonSerializer

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib import colors

# Initialize Razorpay client
try:
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception:
    client = None

# ================= ADMIN ANALYTICS =================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)
        
    data = {
        "total_courses": Course.objects.count(),
        "total_students": User.objects.filter(is_staff=False).count(),
        "total_revenue": Payment.objects.filter(status="Success").aggregate(Sum('amount'))['amount__sum'] or 0,
        "avg_rating": Course.objects.aggregate(Avg('rating'))['rating__avg'] or 4.5
    }
    return Response(data)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_students(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)
        
    students = User.objects.filter(is_staff=False).order_by('-date_joined')
    data = []
    for student in students:
        data.append({
            "id": student.id,
            "fullName": f"{student.first_name} {student.last_name}" if student.first_name else student.username,
            "email": student.email,
            "enrolled_count": student.enrollments.count(),
            "date_joined": student.date_joined.strftime("%Y-%m-%d")
        })
    return Response(data)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_payments(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)
        
    payments = Payment.objects.all().order_by('-created_at')
    data = []
    for p in payments:
        data.append({
            "id": p.id,
            "user": p.user.email,
            "course": p.course.title,
            "amount": p.amount,
            "status": p.status,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return Response(data)

# ================= ADMIN LESSONS =================

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_lessons(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    if request.method == 'GET':
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({"error": "course_id is required"}, status=400)
        lessons = Lesson.objects.filter(course_id=course_id).order_by('order')
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)
        
        # Logic for auto-assigning order on CREATE ONLY
        mutable_data = request.data.copy()
        if 'order' not in mutable_data or not mutable_data['order']:
            last_order = Lesson.objects.filter(course=course).count()
            mutable_data['order'] = last_order + 1
            
        serializer = LessonSerializer(data=mutable_data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_lesson_detail(request, lesson_id):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    if request.method == 'PUT':
        # On UPDATE, we use whatever is provided or keep existing (serializer handles this naturally)
        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        lesson.delete()
        return Response({"message": "Lesson deleted successfully"}, status=204)

# ================= PUBLIC API =================

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def get_courses(request):
    if request.method == 'GET':
        try:
            courses = Course.objects.all()
            serializer = CourseSerializer(courses, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in get_courses: {e}")
            return Response([])
    
    # POST - Create Course (Admin only)
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)
        
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def get_course_detail(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
    except Exception as e:
        print(f"Error finding course: {e}")
        return Response({"error": "Internal Server Error"}, status=500)

    if request.method == 'GET':
        try:
            is_enrolled = False
            if request.user.is_authenticated:
                is_enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
            
            serializer = CourseSerializer(course, context={'request': request})
            data = serializer.data

            if not is_enrolled and not request.user.is_staff:
                if 'lessons' in data:
                    for lesson in data['lessons']:
                        lesson['video_url'] = ""
                data['locked'] = True
            else:
                data['locked'] = False
                if request.user.is_authenticated:
                    completed_lessons = LessonProgress.objects.filter(
                        user=request.user, 
                        lesson__course=course, 
                        completed=True
                    ).values_list('lesson_id', flat=True)
                    
                    if 'lessons' in data:
                        for lesson in data['lessons']:
                            lesson['completed'] = lesson['id'] in completed_lessons
            return Response(data)
        except Exception as e:
            print(f"Error in get_course_detail: {e}")
            return Response({"error": "Failed to load course details"}, status=500)

    # ADMIN ONLY: PUT & DELETE
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    if request.method == 'PUT':
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    if request.method == 'DELETE':
        course.delete()
        return Response({"message": "Course deleted successfully"}, status=204)

# ================= USER API =================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_courses(request):
    try:
        enrollments = Enrollment.objects.filter(user=request.user)
        courses_data = []
        
        for enrollment in enrollments:
            course = enrollment.course
            total_lessons = course.lessons.count()
            completed_lessons = LessonProgress.objects.filter(
                user=request.user, 
                lesson__course=course, 
                completed=True
            ).count()
            
            serializer = CourseSerializer(course, context={'request': request})
            data = serializer.data
            data['total_lessons'] = total_lessons
            data['completed_count'] = completed_lessons
            data['progress_percentage'] = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
            data['is_completed'] = (completed_lessons == total_lessons) and total_lessons > 0
            courses_data.append(data)
            
        return Response(courses_data)
    except Exception as e:
        print(f"Error in my_courses: {e}")
        return Response([])

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_certificate(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    total_lessons = course.lessons.count()
    completed_lessons = LessonProgress.objects.filter(
        user=request.user, 
        lesson__course=course, 
        completed=True
    ).count()

    if total_lessons == 0 or completed_lessons < total_lessons:
        return Response({"error": "Course not completed"}, status=400)

    # Generate PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Background / Border
    p.setStrokeColor(colors.black)
    p.setLineWidth(5)
    p.rect(20, 20, width-40, height-40)
    
    p.setStrokeColor(colors.goldenrod)
    p.setLineWidth(2)
    p.rect(30, 30, width-60, height-60)

    # Text
    p.setFont("Helvetica-Bold", 40)
    p.drawCentredString(width/2, height-150, "CERTIFICATE OF COMPLETION")
    
    p.setFont("Helvetica", 20)
    p.drawCentredString(width/2, height-220, "This is to certify that")
    
    p.setFont("Helvetica-BoldOblique", 35)
    try:
        user_name = request.user.profile.full_name
        if not user_name:
            raise Exception("Name empty")
    except Exception:
        user_name = f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.email
    
    p.drawCentredString(width/2, height-280, user_name.upper())
    
    p.setFont("Helvetica", 20)
    p.drawCentredString(width/2, height-340, "has successfully completed the course")
    
    p.setFont("Helvetica-Bold", 30)
    p.drawCentredString(width/2, height-400, course.title.upper())
    
    from datetime import date
    p.setFont("Helvetica", 15)
    p.drawCentredString(width/2, 100, f"Awarded on: {date.today().strftime('%B %d, %Y')}")
    
    p.setFont("Helvetica-Bold", 12)
    p.drawCentredString(width/2, 50, "LUMIÈRE ACADEMY")

    p.showPage()
    p.save()

    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename=f"Certificate_{course.id}.pdf")

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def complete_lesson(request):
    lesson_id = request.data.get('lesson_id')
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    if not Enrollment.objects.filter(user=request.user, course=lesson.course).exists():
        return Response({"error": "Not enrolled in this course"}, status=403)

    progress, created = LessonProgress.objects.get_or_create(
        user=request.user,
        lesson=lesson
    )
    progress.completed = True
    progress.save()

    return Response({"message": "Lesson marked as completed", "completed": True})

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def buy_course(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    if Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({"message": "Already purchased"}, status=200)

    is_test_mode = (
        settings.RAZORPAY_KEY_ID == 'rzp_test_YourKeyId' or 
        not settings.RAZORPAY_KEY_ID or 
        not settings.RAZORPAY_KEY_SECRET
    )

    if is_test_mode:
        Enrollment.objects.get_or_create(user=request.user, course=course)
        # Record Test Payment
        Payment.objects.create(
            user=request.user,
            course=course,
            amount=course.price,
            status="Success",
            razorpay_order_id="test_order",
            razorpay_payment_id="test_payment"
        )
        return Response({"message": "Test Mode: Course purchased successfully", "test_mode": True}, status=201)
    
    return Response({"error": "Please use payment gateway"}, status=400)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_order(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    if Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({"error": "Already purchased"}, status=400)

    amount = int(course.price * 100)
    data = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"course_{course.id}",
        "payment_capture": 1
    }
    
    try:
        if not client:
            raise Exception("Razorpay client not initialized")
        order = client.order.create(data=data)
        return Response({
            "order_id": order['id'],
            "amount": amount,
            "currency": "INR",
            "key": settings.RAZORPAY_KEY_ID,
            "course_title": course.title
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_signature = request.data.get('razorpay_signature')
    course_id = request.data.get('course_id')

    params_dict = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }

    try:
        if not client:
            raise Exception("Razorpay client not initialized")
        client.utility.verify_payment_signature(params_dict)
        
        course = Course.objects.get(id=course_id)
        Enrollment.objects.get_or_create(user=request.user, course=course)
        
        # Record Real Payment
        Payment.objects.create(
            user=request.user,
            course=course,
            amount=course.price,
            status="Success",
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id
        )
        
        return Response({"message": "Payment verified and enrollment successful"})
    except Exception:
        return Response({"error": "Invalid payment signature"}, status=400)