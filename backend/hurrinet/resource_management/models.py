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

    def get_stock_levels(self):
        """
        Calculate stock levels for all item types at this resource location.
        Returns a dictionary of item types and their status details.
        """
        stock_levels = {}

        # Initialize all item types with zero values
        for item_type, _ in InventoryItem.ITEM_TYPES:
            stock_levels[item_type] = {
                "quantity": 0,
                "capacity": 0,
                "status": "Low",
                "percentage": 0,
            }

        # Aggregate inventory items by type
        for item in self.inventory_items.all():
            stock_data = stock_levels[item.item_type]
            stock_data["quantity"] += item.quantity
            stock_data["capacity"] += item.capacity

            # Calculate percentage and status
            if stock_data["capacity"] > 0:
                percentage = (stock_data["quantity"] / stock_data["capacity"]) * 100
                stock_data["percentage"] = round(percentage, 2)
                stock_data["status"] = self._calculate_status(percentage)

        return stock_levels

    @staticmethod
    def _calculate_status(percentage):
        """Calculate status based on percentage of capacity"""
        if percentage <= 25:
            return "Low"
        elif percentage <= 75:
            return "Moderate"
        else:
            return "Sufficient"

    @classmethod
    def get_all_stock_levels(cls):
        """
        Get stock levels for all resource locations.
        Returns a list of locations with their stock levels.
        """
        locations_stock = []

        for resource in cls.objects.all():
            location_data = {
                "id": resource.id,
                "name": resource.name,
                "location": {
                    "type": "Point",
                    "coordinates": [resource.location.x, resource.location.y],
                },
                "address": resource.address,
                "stock_levels": resource.get_stock_levels(),
            }
            locations_stock.append(location_data)

        return locations_stock


class InventoryItem(models.Model):
    """Model for tracking specific inventory items within resources"""

    ITEM_TYPES = [
        ("NONE", "None"),
        ("MEDICAL", "Medical"),
        ("WATER", "Water"),
        ("FOOD", "Food"),
        ("SHELTER", "Shelter/Warmth"),
        ("TOOLS", "Tools/Equipment"),
        ("POWER", "Power/Light"),
        ("COMMUNICATION", "Communication"),
        ("SANITATION", "Sanitation/Hygiene"),
        ("CLOTHING", "Clothing"),
        ("TRANSPORTATION", "Transportation"),
        ("SPECIAL_NEEDS", "Special Needs"),
    ]

    name = models.CharField(max_length=255)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES, default="NONE")
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

    def calculate_status(self):
        """Calculate the status of this inventory item based on quantity vs capacity"""
        if self.capacity <= 0:
            return "Low"

        percentage = (self.quantity / self.capacity) * 100
        if percentage <= 25:
            return "Low"
        elif percentage <= 75:
            return "Moderate"
        else:
            return "Sufficient"

    def get_stock_details(self):
        """Get detailed stock information for this item"""
        percentage = 0
        if self.capacity > 0:
            percentage = (self.quantity / self.capacity) * 100

        return {
            "id": self.id,
            "name": self.name,
            "item_type": self.item_type,
            "item_type_display": self.get_item_type_display(),
            "quantity": self.quantity,
            "capacity": self.capacity,
            "unit": self.unit,
            "status": self.calculate_status(),
            "percentage": round(percentage, 2),
        }

    @classmethod
    def get_aggregated_stock_levels(cls):
        """
        Get aggregated stock levels across all locations by item type.
        Returns overall status for each item type.
        """
        stock_levels = {}

        # Initialize all item types
        for item_type, display_name in cls.ITEM_TYPES:
            stock_levels[item_type] = {
                "type_display": display_name,
                "total_quantity": 0,
                "total_capacity": 0,
                "locations": [],
            }

        # Aggregate data
        for item in cls.objects.select_related("resource").all():
            if item.item_type not in stock_levels:
                continue

            stock_data = stock_levels[item.item_type]
            stock_data["total_quantity"] += item.quantity
            stock_data["total_capacity"] += item.capacity

            if item.resource:
                stock_data["locations"].append(
                    {
                        "resource_id": item.resource.id,
                        "resource_name": item.resource.name,
                        "quantity": item.quantity,
                        "capacity": item.capacity,
                        "status": item.calculate_status(),
                    }
                )

        # Calculate overall status for each type
        for item_type, data in stock_levels.items():
            if data["total_capacity"] > 0:
                percentage = (data["total_quantity"] / data["total_capacity"]) * 100
                data["percentage"] = round(percentage, 2)
                data["status"] = Resource._calculate_status(percentage)
            else:
                data["percentage"] = 0
                data["status"] = "Low"

        return stock_levels


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
