from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MODERATE", "Moderate"),
        ("HIGH", "High"),
        ("EXTREME", "Extreme"),
    ]

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

    title = models.CharField(max_length=255)
    description = models.TextField(default="No description provided")
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    district = models.CharField(max_length=20, choices=DISTRICT_CHOICES, default="All")
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="alerts",
        default=1,  # Default to the first user (usually superuser)
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    affected_areas = models.TextField(blank=True)
    instructions = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.get_severity_display()} - {self.district}"

    class Meta:
        ordering = ["-created_at"]
