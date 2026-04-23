from django.urls import path
from .views import signup_view, login_view, profile_view

urlpatterns = [
    path('auth/signup/', signup_view),
    path('auth/login/', login_view),
    path('profile/', profile_view),
]
