"""
Models for incident reporting in HurriNet.

This module defines models for managing incident reports and flags.
"""

from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import logging

logger = logging.getLogger(__name__)


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
    location = gis_models.PointField(
        help_text="Geographic coordinates of the incident", geography=True, srid=4326
    )
    location_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Approximate community/district name (auto-generated)",
    )
    affected_area = gis_models.PolygonField(
        null=True,
        blank=True,
        help_text="Geographic area affected by the incident",
        srid=4326,
    )
    incident_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    photo = models.ImageField(upload_to="incidents/", null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incidents",
        default=1,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_incidents",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            gis_models.Index(fields=["location"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.incident_type}"

    def get_location_name(self, force_update=False):
        """Performs reverse geocoding to get a location name."""
        if self.location_name and not force_update:
            return self.location_name

        if not self.location:
            return None

        try:
            latitude = self.location.y
            longitude = self.location.x

            geolocator = Nominatim(user_agent="hurrinet_app")
            location_info = geolocator.reverse(
                (latitude, longitude), exactly_one=True, language="en", timeout=10
            )

            if location_info and location_info.address:
                address = location_info.raw.get("address", {})
                name = (
                    address.get("suburb")
                    or address.get("city_district")
                    or address.get("city")
                    or address.get("town")
                    or address.get("village")
                )
                if not name:
                    name = location_info.address.split(",")[0]
                return name.strip()
            else:
                return "Unknown Location"
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            logger.error(f"Reverse geocoding failed for incident {self.id}: {e}")
            return "Geocoding Failed"
        except Exception as e:
            logger.error(
                f"Unexpected error during reverse geocoding for incident {self.id}: {e}"
            )
            return "Error"

    def save(self, *args, **kwargs):
        if self.location and not self.location_name:
            self.location_name = self.get_location_name()
        super().save(*args, **kwargs)


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
