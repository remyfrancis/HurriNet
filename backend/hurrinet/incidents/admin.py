"""
Admin configuration for the incidents app.

This module defines the admin interfaces for incident models.
"""

from django.contrib import admin
from .models import Incident, IncidentUpdate, IncidentFlag


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    """Admin interface for incidents."""

    list_display = (
        "id",
        "title",
        "incident_type",
        "severity",
        "status",
        "location",
        "reported_by",
        "assigned_to",
        "created_at",
        "is_active",
    )
    list_filter = (
        "incident_type",
        "severity",
        "status",
        "is_active",
        "created_at",
    )
    search_fields = (
        "title",
        "description",
        "location",
        "reported_by__email",
        "assigned_to__email",
    )
    readonly_fields = ("created_at", "updated_at", "resolved_at")
    raw_id_fields = ("reported_by", "verified_by", "assigned_to")
    date_hierarchy = "created_at"


@admin.register(IncidentUpdate)
class IncidentUpdateAdmin(admin.ModelAdmin):
    """Admin interface for incident updates."""

    list_display = ("id", "incident", "author", "created_at")
    list_filter = ("created_at",)
    search_fields = ("content", "author__email", "incident__title")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("incident", "author")
    date_hierarchy = "created_at"


@admin.register(IncidentFlag)
class IncidentFlagAdmin(admin.ModelAdmin):
    """Admin interface for incident flags."""

    list_display = (
        "id",
        "incident",
        "reported_by",
        "reason",
        "reviewed",
        "reviewed_by",
        "created_at",
    )
    list_filter = ("reason", "reviewed", "created_at")
    search_fields = (
        "description",
        "reported_by__email",
        "reviewed_by__email",
        "incident__title",
    )
    readonly_fields = ("created_at", "reviewed_at")
    raw_id_fields = ("incident", "reported_by", "reviewed_by")
    date_hierarchy = "created_at"
