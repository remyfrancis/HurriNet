"""
Admin configuration for the incidents app.

This module defines the admin interfaces for incident models.
"""

from django.contrib import admin
from .models import Incident, IncidentUpdate, IncidentFlag


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    """Admin interface for incidents."""

    list_display = [
        "title",
        "incident_type",
        "severity",
        "location",
        "created_by",
        "created_at",
        "is_resolved",
    ]
    list_filter = ["incident_type", "severity", "is_resolved", "created_at"]
    search_fields = ["title", "description", "location"]
    readonly_fields = ["created_at", "updated_at", "resolved_at"]
    raw_id_fields = ["created_by", "resolved_by"]


@admin.register(IncidentUpdate)
class IncidentUpdateAdmin(admin.ModelAdmin):
    """Admin interface for incident updates."""

    list_display = ["incident", "author", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["content", "incident__title"]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["incident", "author"]


@admin.register(IncidentFlag)
class IncidentFlagAdmin(admin.ModelAdmin):
    """Admin interface for incident flags."""

    list_display = ["incident", "reported_by", "reason", "created_at", "reviewed"]
    list_filter = ["reason", "reviewed", "created_at"]
    search_fields = ["description", "incident__title"]
    readonly_fields = ["created_at", "reviewed_at"]
    raw_id_fields = ["incident", "reported_by", "reviewed_by"]
