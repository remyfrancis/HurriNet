"""
Models for incident reporting in HurriNet.

This module defines models for managing incident reports and flags.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()


def incident_photo_path(instance, filename):
    # Generate file path: media/incidents/YYYY/MM/DD/uuid_filename
    ext = filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return f"incidents/{timezone.now():%Y/%m/%d}/{new_filename}"


class Incident(models.Model):
    """Model for incident reports."""

    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MODERATE", "Moderate"),
        ("HIGH", "High"),
        ("EXTREME", "Extreme"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, default="Location not specified")
    incident_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    photo = models.ImageField(upload_to="incidents/", null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="incidents",
        default=1,  # Default to the first user (usually superuser)
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_incidents",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.incident_type}"


class IncidentUpdate(models.Model):
    """Model for updates on incidents."""

    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="updates"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incident_updates",
    )
    content = models.TextField()
    attachment = models.FileField(
        upload_to="incident_updates/%Y/%m/%d/", null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Update on {self.incident} by {self.author.email}"


class IncidentFlag(models.Model):
    """Model for flagging incidents."""

    FLAG_REASONS = [
        ("DUPLICATE", "Duplicate Report"),
        ("INACCURATE", "Inaccurate Information"),
        ("RESOLVED", "Already Resolved"),
        ("INAPPROPRIATE", "Inappropriate Content"),
        ("OTHER", "Other"),
    ]

    incident = models.ForeignKey(
        Incident, on_delete=models.CASCADE, related_name="flags"
    )
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reported_flags",
    )
    reason = models.CharField(max_length=20, choices=FLAG_REASONS)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_flags",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Flag on {self.incident} by {self.reported_by.email}"
