from django.db import models
from django.contrib.gis.db import models as gis_models
from django.conf import settings


class MedicalFacility(models.Model):
    FACILITY_TYPES = [
        ("HOSPITAL", "Hospital"),
        ("CLINIC", "Clinic"),
        ("FIELD_STATION", "Field Station"),
        ("EMERGENCY_CENTER", "Emergency Center"),
    ]

    STATUS_CHOICES = [
        ("OPERATIONAL", "Fully Operational"),
        ("LIMITED", "Limited Services"),
        ("CRITICAL", "Critical Resources Only"),
        ("OFFLINE", "Not Operational"),
    ]

    name = models.CharField(max_length=255)
    facility_type = models.CharField(max_length=20, choices=FACILITY_TYPES)
    address = models.CharField(max_length=255)
    # location = gis_models.PointField()

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="OPERATIONAL"
    )
    total_capacity = models.IntegerField(help_text="Total number of beds/patients")
    current_occupancy = models.IntegerField(default=0)

    # Resource availability indicators
    has_power = models.BooleanField(default=True)
    has_water = models.BooleanField(default=True)
    has_oxygen = models.BooleanField(default=True)
    has_ventilators = models.BooleanField(default=True)

    # Contact information
    primary_contact = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def available_capacity(self):
        """Calculate available capacity"""
        return max(0, self.total_capacity - self.current_occupancy)

    def occupancy_percentage(self):
        """Calculate occupancy percentage"""
        if self.total_capacity > 0:
            return (self.current_occupancy / self.total_capacity) * 100
        return 0

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class MedicalSupply(models.Model):
    SUPPLY_TYPES = [
        ("MEDICATION", "Medication"),
        ("EQUIPMENT", "Medical Equipment"),
        ("PPE", "Personal Protective Equipment"),
        ("FIRST_AID", "First Aid Supplies"),
        ("BLOOD", "Blood Products"),
        ("OTHER", "Other Supplies"),
    ]

    facility = models.ForeignKey(
        MedicalFacility, on_delete=models.CASCADE, related_name="supplies"
    )
    name = models.CharField(max_length=255)
    supply_type = models.CharField(max_length=20, choices=SUPPLY_TYPES)
    quantity = models.IntegerField()
    threshold_level = models.IntegerField(help_text="Minimum required quantity")
    expiration_date = models.DateField(null=True, blank=True)

    def is_critical(self):
        """Check if supply is at or below critical level"""
        return self.quantity <= self.threshold_level

    def __str__(self):
        return f"{self.name} ({self.quantity} units)"


class MedicalEmergency(models.Model):
    SEVERITY_LEVELS = [
        ("LOW", "Low Priority"),
        ("MEDIUM", "Medium Priority"),
        ("HIGH", "High Priority"),
        ("CRITICAL", "Critical Priority"),
    ]

    STATUS_CHOICES = [
        ("REPORTED", "Reported"),
        ("ASSIGNED", "Assigned"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
    ]

    incident_id = models.CharField(max_length=20, unique=True)
    location_lat = models.FloatField()
    location_lng = models.FloatField()
    description = models.TextField()
    reported_time = models.DateTimeField(auto_now_add=True)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="REPORTED")

    # Assignment details
    assigned_facility = models.ForeignKey(
        MedicalFacility,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_emergencies",
    )
    assignment_time = models.DateTimeField(null=True, blank=True)

    # Resolution details
    resolution_notes = models.TextField(blank=True)
    resolved_time = models.DateTimeField(null=True, blank=True)

    def time_since_reported(self):
        """Calculate time elapsed since incident was reported"""
        from django.utils import timezone

        return timezone.now() - self.reported_time

    def __str__(self):
        return f"Medical Emergency {self.incident_id} - {self.get_severity_display()}"


class FacilityStatusReport(models.Model):
    REPORT_PRIORITY = [
        ("LOW", "Low Priority"),
        ("MEDIUM", "Medium Priority"),
        ("HIGH", "High Priority"),
        ("CRITICAL", "Critical Priority"),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="facility_reports",
    )
    facilities = models.ManyToManyField(MedicalFacility, related_name="status_reports")
    timestamp = models.DateTimeField(auto_now_add=True)
    priority = models.CharField(max_length=10, choices=REPORT_PRIORITY)
    title = models.CharField(max_length=255)
    description = models.TextField()
    acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="acknowledged_reports",
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.get_priority_display()} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        ordering = ["-timestamp"]
