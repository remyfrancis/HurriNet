from django.db import models
from django.utils import timezone


class Contact(models.Model):
    organization = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization"]

    def __str__(self):
        return f"{self.organization} - {self.phone_number}"
