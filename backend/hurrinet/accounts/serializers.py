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
    - email: User's email address
    - first_name: User's first name
    - last_name: User's last name
    - role: User's role in the system
    - phone_number: User's contact number
    - address: User's address
    - first_responder_id: First responder identification
    - medical_license_id: Medical license number
    - is_active: User's active status
    """

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "address",
            "first_responder_id",
            "medical_license_id",
            "is_active",
        )
        read_only_fields = ("is_active",)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    This serializer handles:
    1. Validation of registration data
    2. Creation of new user accounts
    3. Password handling and security

    Fields:
    - email: Required, unique email address
    - password: Required, write-only field
    - first_name: Required user's first name
    - last_name: Required user's last name
    - role: Required user role
    - phone_number: Optional contact number
    - address: Required address
    - first_responder_id: Optional first responder ID
    - medical_license_id: Optional medical license number
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "address",
            "first_responder_id",
            "medical_license_id",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            "role": {"required": True},
            "address": {"required": True},
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
            user = User.objects.create_user(**validated_data)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")
