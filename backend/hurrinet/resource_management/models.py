from django.contrib.gis.db import models
from django.conf import settings


class Resource(models.Model):
    """
    Main model for managing emergency resources with geographic tracking.
    Implements comprehensive status tracking and location management.
    """

    RESOURCE_TYPES = [
        ("SHELTER", "Shelter"),
        ("MEDICAL", "Medical"),
        ("SUPPLIES", "Supplies"),
        ("WATER", "Water"),
    ]

    STATUS_CHOICES = [
        ("AVAILABLE", "Available"),
        ("LIMITED", "Limited"),
        ("UNAVAILABLE", "Unavailable"),
        ("ASSIGNED", "Assigned"),
    ]

    # Basic resource information
    name = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    description = models.TextField(blank=True)

    # Status and capacity tracking
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="AVAILABLE"
    )
    capacity = models.IntegerField(
        help_text="Maximum capacity/quantity of this resource"
    )
    current_count = models.IntegerField(help_text="Current available quantity")
    current_workload = models.IntegerField(
        default=0, help_text="Current usage/assignment load"
    )

    # Geographic information
    location = models.PointField(srid=4326, help_text="Geographic coordinates")
    address = models.CharField(max_length=255)
    coverage_area = models.PolygonField(
        srid=4326, null=True, blank=True, help_text="Area this resource can service"
    )

    # Assignment and management
    assigned_to = models.ForeignKey(
        "incidents.Incident",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_resources",
    )
    assigned_request = models.ForeignKey(
        "ResourceRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_resource",
    )
    managed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="managed_resources",
    )
    last_assignment_cost = models.FloatField(
        null=True, blank=True, help_text="Cost metric from last assignment"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["resource_type", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_resource_type_display()} - {self.get_status_display()})"

    def update_status(self):
        """Update status based on current capacity and workload"""
        if self.current_count <= 0:
            self.status = "UNAVAILABLE"
        elif self.current_workload >= self.capacity:
            self.status = "ASSIGNED"
        elif self.current_count < self.capacity * 0.25:  # Less than 25% available
            self.status = "LIMITED"
        else:
            self.status = "AVAILABLE"
        self.save()


class InventoryItem(models.Model):
    """Model for tracking specific inventory items within resources"""

    name = models.CharField(max_length=255)
    quantity = models.IntegerField()
    unit = models.CharField(max_length=50)
    capacity = models.IntegerField()
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="inventory_items",
        null=True,  # Making it nullable initially
        blank=True,
    )
    supplier = models.ForeignKey(
        "Supplier",
        on_delete=models.SET_NULL,
        related_name="supplied_items",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"


class ResourceRequest(models.Model):
    """Model for tracking resource allocation requests"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="requests",
        null=True,  # Making it nullable initially
        blank=True,
    )
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        null=True,  # Making it nullable initially
        blank=True,
    )
    quantity = models.IntegerField()
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resource_requests",
        null=True,  # Making it nullable initially
        blank=True,
    )
    location = models.PointField(srid=4326, help_text="Request location")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    priority = models.IntegerField(default=0, help_text="Priority level of the request")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        resource_name = self.resource.name if self.resource else "Unassigned"
        return f"Request for {resource_name} - {self.get_status_display()}"


class Distribution(models.Model):
    """Model for tracking resource distribution operations"""

    location = models.PointField(srid=4326)
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="distributions",
        null=True,  # Making it nullable initially
        blank=True,
    )
    total_requests = models.IntegerField()
    fulfilled_requests = models.IntegerField()
    distribution_area = models.PolygonField(srid=4326, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Distribution at {self.location} ({self.fulfilled_requests}/{self.total_requests})"


class Supplier(models.Model):
    """Model for tracking suppliers of resources and inventory items"""

    SUPPLIER_TYPES = [
        ("MEDICAL", "Medical Supplies"),
        ("FOOD", "Food and Water"),
        ("SHELTER", "Shelter Materials"),
        ("EQUIPMENT", "Equipment"),
        ("OTHER", "Other Supplies"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
        ("PENDING", "Pending Approval"),
    ]

    name = models.CharField(max_length=255)
    supplier_type = models.CharField(max_length=20, choices=SUPPLIER_TYPES)
    description = models.TextField(blank=True)
    contact_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)
    location = models.PointField(
        srid=4326, null=True, blank=True, help_text="Geographic coordinates"
    )
    website = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["supplier_type", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_supplier_type_display()})"
