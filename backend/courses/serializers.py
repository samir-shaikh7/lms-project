from rest_framework import serializers
from .models import Course, Lesson

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'video_url', 'duration', 'order']


class CourseSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'price',
            'image',
            'category',
            'rating',
            'lessons',
            'is_enrolled'
        ]

    # ✅ SAFE lessons fetch (no crash)
    def get_lessons(self, obj):
        try:
            lessons = obj.lessons.all().order_by('order')
            return LessonSerializer(lessons, many=True).data
        except Exception:
            return []

    # ✅ SAFE enrollment check (no 500)
    def get_is_enrolled(self, obj):
        request = self.context.get('request')

        try:
            if request and hasattr(request, "user") and request.user.is_authenticated:
                from .models import Enrollment
                return Enrollment.objects.filter(user=request.user, course=obj).exists()
        except Exception:
            return False

        return False