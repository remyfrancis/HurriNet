from django.db import models


class Shelter(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("CLOSED", "Closed"),
        ("FULL", "Full"),
    ]

    name = models.CharField(max_length=255)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    capacity = models.IntegerField()
    current_occupancy = models.IntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="OPEN")
    description = models.TextField(blank=True)
    facilities = models.TextField(blank=True)  # e.g., "Water, Medical Supplies, Food"
    contact_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

    def update_occupancy(self, new_occupancy):
        self.current_occupancy = new_occupancy
        if new_occupancy >= self.capacity:
            self.status = "FULL"
        elif new_occupancy > 0:
            self.status = "OPEN"
        self.save()
