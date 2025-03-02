from django.db import models
from django.utils import timezone

class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    DISTRICT_CHOICES = [
        ('Castries', 'Castries'),
        ('Gros Islet', 'Gros Islet'),
        ('Vieux Fort', 'Vieux Fort'),
        ('Soufriere', 'Soufriere'),
        ('Micoud', 'Micoud'),
        ('Dennery', 'Dennery'),
        ('Laborie', 'Laborie'),
        ('Choiseul', 'Choiseul'),
        ('Anse La Raye', 'Anse La Raye'),
        ('Canaries', 'Canaries'),
        ('All', 'All Districts'),  # For alerts that affect the entire country
    ]

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    district = models.CharField(max_length=20, choices=DISTRICT_CHOICES, default='All')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.district} ({self.severity})"

    class Meta:
        ordering = ['-created_at']
