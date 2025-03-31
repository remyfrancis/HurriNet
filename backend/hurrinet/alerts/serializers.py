"""
Serializers for the Alerts application.
This module handles the conversion of Alert and User models to/from JSON
for the REST API endpoints.
"""

from rest_framework import serializers
from .models import Alert
from django.contrib.auth import get_user_model

# Get the active User model as defined in settings
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.

    Provides a simplified representation of User objects,
    exposing only necessary fields for alert-related operations.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
        ]  # Only expose non-sensitive user information


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer for Alert model.

    Handles the serialization and deserialization of Alert objects,
    including nested user information and human-readable severity levels.
    """

    # Nested serializer for the alert creator's information
    created_by = UserSerializer(read_only=True)

    # Add human-readable severity level to the serialized output
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "title",
            "description",
            "severity",
            "severity_display",  # Human-readable severity level
            "created_by",  # Nested user information
            "created_at",
            "updated_at",
            "is_active",
            "is_public",
            "affected_areas",
            "instructions",
        ]
        # Protect fields that should not be modified directly by API clients
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        """
        Custom create method to automatically set the alert creator.

        Args:
            validated_data: Dictionary of validated field values.

        Returns:
            Alert: The newly created alert instance.
        """
        # Set the creator to the authenticated user making the request
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
