from django.urls import path
from . import views

urlpatterns = [
    # ADMIN
    path('admin/dashboard/', views.admin_dashboard),
    path('admin/students/', views.admin_students),
    path('admin/payments/', views.admin_payments),
    path('admin/lessons/', views.admin_lessons),
    path('admin/lessons/<int:lesson_id>/', views.admin_lesson_detail),
    
    # COURSES
    path('courses/', views.get_courses),
    path('courses/<int:course_id>/', views.get_course_detail),
    path('my-courses/', views.my_courses),
    path('buy-course/<int:course_id>/', views.buy_course),
    path('complete-lesson/', views.complete_lesson),
    path('certificate/<int:course_id>/', views.get_certificate),
    path('create-order/<int:course_id>/', views.create_order),
    path('verify-payment/', views.verify_payment),
]