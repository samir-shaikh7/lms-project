import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.test import Client
from courses.models import Course, Lesson
from django.contrib.auth import get_user_model

User = get_user_model()

def run_tests():
    client = Client()
    print("--- Testing API Endpoints ---")
    
    print("\n1. GET /api/courses/")
    response = client.get('/api/courses/')
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content[:100]}...")

    print("\n2. GET /api/courses/9999/ (Non-existent)")
    response = client.get('/api/courses/9999/')
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content}")

    # Create dummy user
    user, created = User.objects.get_or_create(email='test@example.com')
    if created:
        user.set_password('testpass')
        user.save()
    
    print("\n3. Login to get token")
    response = client.post('/api/auth/login/', json.dumps({'email': 'test@example.com', 'password': 'testpass'}), content_type="application/json")
    print(f"Login Status: {response.status_code}")
    token = ""
    try:
        data = json.loads(response.content)
        token = data.get('token') or data.get('key')
    except:
        pass
        
    print(f"Token: {token}")

    print("\n4. GET /api/my-courses/ (with token)")
    headers = {}
    if token:
        headers['HTTP_AUTHORIZATION'] = f'Token {token}'
    
    response = client.get('/api/my-courses/', **headers)
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content[:100]}...")

if __name__ == '__main__':
    run_tests()
