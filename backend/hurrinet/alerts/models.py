"""
Models for the Alerts application in HurriNet.
This module defines the data structure for emergency alerts and notifications.
"""

from django.db import models
from django.contrib.auth import get_user_model

# Get the active User model as defined in settings
User = get_user_model()


class Alert(models.Model):
    """
    Model representing an emergency alert in the system.

    This model stores information about emergency alerts including their severity,
    geographical scope, and relevant safety instructions. Alerts can be targeted
    to specific districts or broadcast system-wide.
    """

    # Predefined choices for alert severity levels
    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MODERATE", "Moderate"),
        ("HIGH", "High"),
        ("EXTREME", "Extreme"),
    ]

    # Available districts in Saint Lucia for targeted alerts
    DISTRICT_CHOICES = [
        ("Castries", "Castries"),
        ("Gros Islet", "Gros Islet"),
        ("Vieux Fort", "Vieux Fort"),
        ("Soufriere", "Soufriere"),
        ("Micoud", "Micoud"),
        ("Dennery", "Dennery"),
        ("Laborie", "Laborie"),
        ("Choiseul", "Choiseul"),
        ("Anse La Raye", "Anse La Raye"),
        ("Canaries", "Canaries"),
        ("All", "All Districts"),  # For alerts that affect the entire country
    ]

    # Basic alert information
    title = models.CharField(max_length=255)
    description = models.TextField(default="No description provided")
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    district = models.CharField(max_length=20, choices=DISTRICT_CHOICES, default="All")

    # Relationship and tracking fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="alerts",
        default=1,  # Default to the first user (usually superuser)
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Automatically set on creation
    updated_at = models.DateTimeField(auto_now=True)  # Automatically updated on save

    # Alert status flags
    is_active = models.BooleanField(
        default=True
    )  # Whether the alert is currently active
    is_public = models.BooleanField(
        default=True
    )  # Whether the alert is visible to the public

    # Detailed location and safety information
    affected_areas = models.TextField(
        blank=True
    )  # Specific areas affected within the district
    instructions = models.TextField(blank=True)  # Safety instructions and guidance

    def __str__(self):
        """
        String representation of the Alert model.
        Returns a formatted string with key alert information.
        """
        return f"{self.title} - {self.get_severity_display()} - {self.district}"

    class Meta:
        """
        Meta options for the Alert model.
        """

        ordering = ["-created_at"]  # Sort alerts by creation date, newest first
