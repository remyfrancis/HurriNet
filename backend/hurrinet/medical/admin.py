from django.contrib import admin
from .models import MedicalFacility, MedicalSupply, MedicalEmergency


@admin.register(MedicalFacility)
class MedicalFacilityAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "facility_type",
        "status",
        "total_capacity",
        "current_occupancy",
        "available_capacity",
        "occupancy_percentage",
    ]
    list_filter = [
        "status",
        "facility_type",
        "has_power",
        "has_water",
        "has_oxygen",
        "has_ventilators",
    ]
    search_fields = ["name", "address", "primary_contact", "phone_number", "email"]
    readonly_fields = ["last_updated", "created_at"]
    fieldsets = (
        (None, {"fields": ("name", "facility_type", "address")}),
        (
            "Capacity Information",
            {"fields": ("total_capacity", "current_occupancy", "status")},
        ),
        (
            "Resource Availability",
            {"fields": ("has_power", "has_water", "has_oxygen", "has_ventilators")},
        ),
        (
            "Contact Information",
            {"fields": ("primary_contact", "phone_number", "email")},
        ),
        (
            "Timestamps",
            {"fields": ("last_updated", "created_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(MedicalSupply)
class MedicalSupplyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "facility",
        "supply_type",
        "quantity",
        "threshold_level",
        "is_critical",
    ]
    list_filter = ["supply_type", "facility"]
    search_fields = ["name", "facility__name"]
    raw_id_fields = ["facility"]
    list_select_related = ["facility"]

    def is_critical(self, obj):
        return obj.is_critical()

    is_critical.boolean = True
    is_critical.short_description = "Critical Level"


@admin.register(MedicalEmergency)
class MedicalEmergencyAdmin(admin.ModelAdmin):
    list_display = [
        "incident_id",
        "severity",
        "status",
        "reported_time",
        "assigned_facility",
        "time_since_reported",
    ]
    list_filter = ["severity", "status", "assigned_facility"]
    search_fields = ["incident_id", "description"]
    readonly_fields = [
        "incident_id",
        "reported_time",
        "assignment_time",
        "resolved_time",
    ]
    raw_id_fields = ["assigned_facility"]
    fieldsets = (
        (None, {"fields": ("incident_id", "severity", "status", "description")}),
        ("Location", {"fields": ("location_lat", "location_lng")}),
        ("Assignment", {"fields": ("assigned_facility", "assignment_time")}),
        ("Resolution", {"fields": ("resolution_notes", "resolved_time")}),
        ("Timestamps", {"fields": ("reported_time",), "classes": ("collapse",)}),
    )
