"""
Serializers for incident reporting in HurriNet.

This module provides serializers for converting incident models to/from JSON.
"""

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django.contrib.auth import get_user_model
from .models import Incident, IncidentUpdate, IncidentFlag

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):
    """Brief serializer for user information in incident contexts."""

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role")
        read_only_fields = fields


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for incident updates."""

    author = UserBriefSerializer(read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = IncidentUpdate
        fields = (
            "id",
            "incident",
            "author",
            "content",
            "attachment",
            "attachment_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("incident", "author")

    def get_attachment_url(self, obj):
        """Get the full URL for the attachment if it exists."""
        if obj.attachment:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None


class IncidentFlagSerializer(serializers.ModelSerializer):
    """Serializer for incident flags."""

    reported_by = UserBriefSerializer(read_only=True)
    reviewed_by = UserBriefSerializer(read_only=True)
    reason_display = serializers.CharField(source="get_reason_display", read_only=True)

    class Meta:
        model = IncidentFlag
        fields = (
            "id",
            "incident",
            "reported_by",
            "reason",
            "reason_display",
            "description",
            "created_at",
            "reviewed",
            "reviewed_by",
            "reviewed_at",
        )
        read_only_fields = (
            "incident",
            "reported_by",
            "reviewed",
            "reviewed_by",
            "reviewed_at",
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class IncidentSerializer(GeoFeatureModelSerializer):
    """Serializer for incidents with spatial data support."""

    created_by = UserSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        geo_field = "location"
        fields = [
            "id",
            "title",
            "description",
            "location",
            "affected_area",
            "incident_type",
            "severity",
            "photo_url",
            "created_by",
            "created_at",
            "updated_at",
            "is_resolved",
            "resolved_at",
            "resolved_by",
        ]
        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
            "resolved_at",
            "resolved_by",
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            return self.context["request"].build_absolute_uri(obj.photo.url)
        return None


class IncidentCreateSerializer(GeoFeatureModelSerializer):
    """Serializer for creating incidents with spatial data."""

    class Meta:
        model = Incident
        geo_field = "location"
        fields = (
            "title",
            "description",
            "incident_type",
            "severity",
            "location",
            "affected_area",
            "photo",
        )

    def create(self, validated_data):
        # Get the user from the request context
        user = self.context["request"].user
        # Create the incident with the user as created_by
        return Incident.objects.create(created_by=user, **validated_data)

    def validate_location(self, value):
        """Validate the location GeoJSON data."""
        if not value or not isinstance(value, dict):
            raise serializers.ValidationError("Location data is required")

        if value.get("type") != "Point":
            raise serializers.ValidationError("Location must be a GeoJSON Point")

        coordinates = value.get("coordinates")
        if not coordinates or len(coordinates) != 2:
            raise serializers.ValidationError(
                "Location must have valid coordinates [longitude, latitude]"
            )

        longitude, latitude = coordinates
        if not (-180 <= longitude <= 180) or not (-90 <= latitude <= 90):
            raise serializers.ValidationError(
                "Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90"
            )

        return value
