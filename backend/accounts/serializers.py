from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class SignupSerializer(serializers.Serializer):
    """
    Validates signup data and creates User + UserProfile.
    """
    fullName = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    phone = serializers.CharField(max_length=20)

    def validate_email(self, value):
        """Check if email is already registered."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """Create User + UserProfile together."""
        # Create Django User (password is automatically hashed by create_user)
        user = User.objects.create_user(
            username=validated_data['email'],  # use email as username
            email=validated_data['email'],
            password=validated_data['password'],
        )

        # Create UserProfile linked to this user
        UserProfile.objects.create(
            user=user,
            full_name=validated_data['fullName'],
            phone=validated_data['phone'],
        )

        return user


class LoginSerializer(serializers.Serializer):
    """
    Validates login credentials.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializes UserProfile and nested User data for the profile API.
    """
    email = serializers.EmailField(source='user.email', read_only=True)
    fullName = serializers.CharField(source='full_name')

    class Meta:
        model = UserProfile
        fields = ['fullName', 'email', 'phone', 'city', 'state', 'country']

    def update(self, instance, validated_data):
        # DRF source='full_name' handles the mapping automatically if we pass validated_data
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.country = validated_data.get('country', instance.country)
        instance.save()
        return instance
