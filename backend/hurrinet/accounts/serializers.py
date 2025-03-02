"""
Serializers for the accounts app.

This module provides serializers for:
1. User model serialization (UserSerializer)
2. User registration (RegisterSerializer)

These serializers handle data validation and transformation
between complex types and Python native datatypes.
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    This serializer handles:
    1. Converting User model instances to JSON
    2. Converting JSON data to User model instances
    3. Validation of user data

    Fields:
    - id: User's unique identifier
    - username: User's username
    - email: User's email address
    - user_type: User's role/type in the system
    - phone_number: User's contact number
    - location: User's location information
    - organization: User's affiliated organization
    - verified: User's verification status (read-only)
    """

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "user_type",
            "phone_number",
            "location",
            "organization",
            "verified",
        )
        read_only_fields = ("verified",)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    This serializer handles:
    1. Validation of registration data
    2. Creation of new user accounts
    3. Password handling and security

    Fields:
    - username: Required, unique username
    - email: Required, unique email address
    - password: Required, write-only field
    - first_name: Required user's first name
    - last_name: Optional user's last name
    - user_type: Required user role/type
    - phone_number: Optional contact number
    - location: Required location information
    - organization: Optional organization name

    The create method handles proper user creation using
    the User.objects.create_user method to ensure secure
    password hashing.
    """

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "user_type",
            "phone_number",
            "location",
            "organization",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
            "username": {"required": True},
            "first_name": {"required": True},
            "user_type": {"required": True},
            "location": {"required": True},
        }

    def create(self, validated_data):
        """
        Create and return a new user instance.

        This method:
        1. Takes validated registration data
        2. Creates a new user using create_user method
        3. Handles any creation errors

        Args:
            validated_data: Dictionary of validated user data

        Returns:
            User: Newly created user instance

        Raises:
            ValidationError: If user creation fails
        """
        try:
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
                first_name=validated_data.get("first_name", ""),
                last_name=validated_data.get("last_name", ""),
                user_type=validated_data.get("user_type", "public"),
                location=validated_data.get("location", ""),
                phone_number=validated_data.get("phone_number", ""),
                organization=validated_data.get("organization", ""),
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")
