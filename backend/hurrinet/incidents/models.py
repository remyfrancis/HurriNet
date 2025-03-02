"""
Models for incident reporting in HurriNet.

This module defines models for managing incident reports and flags.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


def incident_photo_path(instance, filename):
    # Generate file path: media/incidents/YYYY/MM/DD/uuid_filename
    ext = filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return f"incidents/{timezone.now():%Y/%m/%d}/{new_filename}"


class Incident(models.Model):
    """Model for incident reports."""

    INCIDENT_TYPES = [
        ("FLOOD", "Flooding"),
        ("DEBRIS", "Debris/Blockage"),
        ("POWER", "Power Outage"),
        ("STRUCTURE", "Structural Damage"),
        ("MEDICAL", "Medical Emergency"),
        ("FIRE", "Fire"),
        ("OTHER", "Other"),
    ]

    SEVERITY_LEVELS = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    ]

    STATUS_CHOICES = [
        ("REPORTED", "Reported"),
        ("VERIFIED", "Verified"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
    ]

    title = models.CharField(max_length=255, default="Untitled Incident")
    description = models.TextField(blank=True, default="")
    incident_type = models.CharField(
        max_length=20, choices=INCIDENT_TYPES, default="OTHER"
    )
    severity = models.CharField(
        max_length=10, choices=SEVERITY_LEVELS, default="MEDIUM"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="REPORTED")
    location = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="reported_incidents",
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_incidents",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_incidents",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    attachment = models.FileField(
        upload_to="incident_attachments/%Y/%m/%d/", null=True, blank=True
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_incident_type_display()}) at {self.location or 'Unknown Location'}"


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
