"""
Serializers for incident reporting in HurriNet.

This module provides serializers for converting incident models to/from JSON.
"""

from rest_framework import serializers
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


class IncidentSerializer(serializers.ModelSerializer):
    """Serializer for incidents with detailed information."""

    reported_by = UserBriefSerializer(read_only=True)
    verified_by = UserBriefSerializer(read_only=True)
    assigned_to = UserBriefSerializer(read_only=True)
    incident_type_display = serializers.CharField(
        source="get_incident_type_display", read_only=True
    )
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    updates = IncidentUpdateSerializer(many=True, read_only=True)
    flags = IncidentFlagSerializer(many=True, read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = (
            "id",
            "title",
            "description",
            "incident_type",
            "incident_type_display",
            "severity",
            "severity_display",
            "status",
            "status_display",
            "location",
            "latitude",
            "longitude",
            "reported_by",
            "verified_by",
            "assigned_to",
            "created_at",
            "updated_at",
            "resolved_at",
            "attachment",
            "attachment_url",
            "is_active",
            "updates",
            "flags",
        )
        read_only_fields = (
            "reported_by",
            "verified_by",
            "assigned_to",
            "resolved_at",
            "is_active",
        )

    def get_attachment_url(self, obj):
        """Get the full URL for the attachment if it exists."""
        if obj.attachment:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None


class IncidentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating incidents."""

    class Meta:
        model = Incident
        fields = (
            "title",
            "description",
            "incident_type",
            "severity",
            "location",
            "latitude",
            "longitude",
            "attachment",
        )
