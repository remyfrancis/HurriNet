from django.db import models
from django.utils import timezone
import uuid

def incident_photo_path(instance, filename):
    # Generate file path: media/incidents/YYYY/MM/DD/uuid_filename
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return f'incidents/{timezone.now():%Y/%m/%d}/{new_filename}'

class Incident(models.Model):
    INCIDENT_TYPES = [
        ('flooding', 'Flooding'),
        ('landslide', 'Landslide'),
        ('fire', 'Fire'),
        ('powerOutage', 'Power Outage'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('responding', 'Responding'),
        ('resolved', 'Resolved'),
    ]

    tracking_id = models.CharField(max_length=9, unique=True)
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    photo = models.ImageField(upload_to=incident_photo_path, blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.incident_type} - {self.tracking_id}"
