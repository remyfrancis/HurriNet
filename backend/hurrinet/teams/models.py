from django.db import models
from django.contrib.auth.models import User


class Team(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    leader = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="led_teams"
    )
    members = models.ManyToManyField(User, related_name="teams")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    specialty = models.CharField(
        max_length=50,
        choices=[
            ("MEDICAL", "Medical Response"),
            ("INFRASTRUCTURE", "Infrastructure"),
            ("WEATHER", "Weather Response"),
            ("GENERAL", "General Purpose"),
        ],
        default="GENERAL",
    )

    def __str__(self):
        return self.name

    class Meta:
        app_label = "teams"
