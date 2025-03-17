from django.contrib import admin

# Try to import GIS admin classes, fall back to regular ModelAdmin if not available
try:
    from django.contrib.gis.admin import GeoModelAdmin

    geo_admin_class = GeoModelAdmin
except ImportError:
    # If GIS admin is not available, use regular ModelAdmin
    geo_admin_class = admin.ModelAdmin

from .models import Resource, InventoryItem, ResourceRequest, Distribution, Supplier


@admin.register(Resource)
class ResourceAdmin(geo_admin_class):
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
        ("Location", {"fields": ("location", "address", "coverage_area")}),
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
class ResourceRequestAdmin(geo_admin_class):
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
        ("Location", {"fields": ("location",)}),
        ("Requester", {"fields": ("requester",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Distribution)
class DistributionAdmin(geo_admin_class):
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
        ("Location", {"fields": ("location", "distribution_area")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Supplier)
class SupplierAdmin(geo_admin_class):
    list_display = (
        "name",
        "supplier_type",
        "status",
        "contact_name",
        "email",
        "phone",
    )
    list_filter = ("supplier_type", "status")
    search_fields = ("name", "description", "contact_name", "email", "address")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "supplier_type", "description", "status")},
        ),
        (
            "Contact Information",
            {"fields": ("contact_name", "email", "phone", "website")},
        ),
        ("Location", {"fields": ("address", "location")}),
        ("Additional Information", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
