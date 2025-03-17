"""
Simplified admin configuration that doesn't rely on GIS-specific admin classes.
Rename this file to admin.py to use it instead of the GIS-enabled version.
"""

from django.contrib import admin
from .models import Resource, InventoryItem, ResourceRequest, Distribution


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "resource_type",
        "status",
        "capacity",
        "current_count",
        "current_workload",
        "managed_by",
    )
    list_filter = ("resource_type", "status")
    search_fields = ("name", "description", "address")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "resource_type", "description", "status")},
        ),
        ("Capacity", {"fields": ("capacity", "current_count", "current_workload")}),
        ("Location", {"fields": ("address",)}),  # Removed GIS fields
        (
            "Assignment",
            {
                "fields": (
                    "assigned_to",
                    "assigned_request",
                    "managed_by",
                    "last_assignment_cost",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("name", "resource", "quantity", "capacity", "unit")
    list_filter = ("resource__resource_type",)
    search_fields = ("name", "resource__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(ResourceRequest)
class ResourceRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "resource",
        "item",
        "quantity",
        "status",
        "priority",
        "requester",
    )
    list_filter = ("status", "priority")
    search_fields = ("resource__name", "item__name")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Request Details",
            {"fields": ("resource", "item", "quantity", "status", "priority")},
        ),
        # Removed GIS fields
        ("Requester", {"fields": ("requester",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Distribution)
class DistributionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "resource",
        "total_requests",
        "fulfilled_requests",
        "completion_rate",
    )
    list_filter = ("resource__resource_type",)
    search_fields = ("resource__name",)
    readonly_fields = ("created_at", "updated_at", "completion_rate")

    def completion_rate(self, obj):
        if obj.total_requests == 0:
            return "0%"
        return f"{round((obj.fulfilled_requests / obj.total_requests) * 100, 2)}%"

    completion_rate.short_description = "Completion Rate"

    fieldsets = (
        (
            "Distribution Details",
            {
                "fields": (
                    "resource",
                    "total_requests",
                    "fulfilled_requests",
                    "completion_rate",
                )
            },
        ),
        # Removed GIS fields
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
