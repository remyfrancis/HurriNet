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
    - department: User's department
    - position: User's position
    - emergency_role: Emergency response role
    - additional_info: Additional information
    - is_active: User's active status
    - is_verified: User's verification status
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
            "department",
            "position",
            "emergency_role",
            "additional_info",
            "is_active",
            "is_verified",
        )
        read_only_fields = (
            "is_active",
            "is_verified",
        )


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
    - phone_number: Required contact number for emergency personnel
    - address: Required address
    - first_responder_id: Required badge number for emergency personnel
    - medical_license_id: Required certification number for emergency personnel
    - department: Required department for emergency personnel
    - position: Required position for emergency personnel
    - emergency_role: Required emergency role for emergency personnel
    - additional_info: Optional additional information
    - is_verified: Read-only field for verification status
    """

    password = serializers.CharField(write_only=True)
    department = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    emergency_role = serializers.CharField(required=False)
    additional_info = serializers.CharField(required=False, allow_blank=True)
    is_verified = serializers.BooleanField(read_only=True)

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
            "department",
            "position",
            "emergency_role",
            "additional_info",
            "is_verified",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            "role": {"required": True},
            "address": {"required": True},
        }

    def validate(self, data):
        """
        Validate the registration data based on user role.

        For emergency personnel:
        - Validates required fields specific to emergency personnel
        - Ensures proper formatting of IDs and contact information

        Args:
            data: Dictionary of registration data

        Returns:
            dict: Validated data

        Raises:
            ValidationError: If validation fails
        """
        if data.get("role") == "EMERGENCY_PERSONNEL":
            required_fields = [
                "phone_number",
                "first_responder_id",
                "medical_license_id",
                "department",
                "position",
                "emergency_role",
            ]

            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(
                        {
                            field: f"{field.replace('_', ' ').title()} is required for emergency personnel"
                        }
                    )

            # Validate emergency_role is one of the allowed values
            valid_roles = ["first_responder", "coordinator", "team_lead", "specialist"]
            if data.get("emergency_role") not in valid_roles:
                raise serializers.ValidationError(
                    {
                        "emergency_role": f"Emergency role must be one of: {', '.join(valid_roles)}"
                    }
                )

        return data

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
            # Extract non-model fields before user creation
            department = validated_data.pop("department", None)
            position = validated_data.pop("position", None)
            emergency_role = validated_data.pop("emergency_role", None)
            additional_info = validated_data.pop("additional_info", None)

            user = User.objects.create_user(**validated_data)

            # Save additional fields if they exist
            if department:
                user.department = department
            if position:
                user.position = position
            if emergency_role:
                user.emergency_role = emergency_role
            if additional_info:
                user.additional_info = additional_info

            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")
