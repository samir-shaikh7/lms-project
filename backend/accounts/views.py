from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate

from .serializers import SignupSerializer, LoginSerializer, ProfileSerializer
from .models import UserProfile


@api_view(['POST'])
def signup_view(request):
    """
    POST /api/auth/signup/
    Creates a new user and returns a token.
    """
    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # Create auth token for the new user
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'Account created successfully',
            'token': token.key,
            'email': user.email,
            'fullName': user.profile.full_name,
            'is_staff': user.is_staff
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    """
    POST /api/auth/login/
    Validates credentials and returns a token.
    """
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(username=email, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            full_name = ""
            try:
                full_name = user.profile.full_name
            except UserProfile.DoesNotExist:
                pass

            return Response({
                'message': 'Login successful',
                'token': token.key,
                'email': user.email,
                'fullName': full_name,
                'is_staff': user.is_staff
            })

        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET /api/profile/ - Get profile
    PUT /api/profile/ - Update profile
    """
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)

        if request.method == 'GET':
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"error": "Internal Server Error", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
