from rest_framework import serializers
from .models import (
    MedicalFacility,
    MedicalSupply,
    MedicalEmergency,
    FacilityStatusReport,
)


class MedicalSupplySerializer(serializers.ModelSerializer):
    is_critical = serializers.BooleanField(read_only=True)

    class Meta:
        model = MedicalSupply
        fields = [
            "id",
            "facility",
            "name",
            "supply_type",
            "quantity",
            "threshold_level",
            "expiration_date",
            "is_critical",
        ]


class MedicalFacilitySerializer(serializers.ModelSerializer):
    supplies = MedicalSupplySerializer(many=True, read_only=True)
    available_capacity = serializers.IntegerField(read_only=True)
    occupancy_percentage = serializers.FloatField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    facility_type_display = serializers.CharField(
        source="get_facility_type_display", read_only=True
    )

    class Meta:
        model = MedicalFacility
        fields = [
            "id",
            "name",
            "facility_type",
            "facility_type_display",
            "address",
            "status",
            "status_display",
            "total_capacity",
            "current_occupancy",
            "available_capacity",
            "occupancy_percentage",
            "has_power",
            "has_water",
            "has_oxygen",
            "has_ventilators",
            "primary_contact",
            "phone_number",
            "email",
            "last_updated",
            "created_at",
            "supplies",
        ]


class MedicalEmergencySerializer(serializers.ModelSerializer):
    time_since_reported = serializers.DurationField(read_only=True)
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    assigned_facility_name = serializers.CharField(
        source="assigned_facility.name", read_only=True
    )

    class Meta:
        model = MedicalEmergency
        fields = [
            "id",
            "incident_id",
            "location_lat",
            "location_lng",
            "description",
            "reported_time",
            "severity",
            "severity_display",
            "status",
            "status_display",
            "assigned_facility",
            "assigned_facility_name",
            "assignment_time",
            "resolution_notes",
            "resolved_time",
            "time_since_reported",
        ]
        read_only_fields = ["incident_id"]  # Generated automatically


class MedicalEmergencyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalEmergency
        fields = [
            "location_lat",
            "location_lng",
            "description",
            "severity",
            "assigned_facility",
        ]

    def create(self, validated_data):
        # Generate a unique incident ID (you might want to implement your own logic)
        from django.utils import timezone
        import uuid

        validated_data["incident_id"] = (
            f"MED-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        )
        return super().create(validated_data)


class FacilityStatusReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(
        source="reporter.get_full_name", read_only=True
    )
    reporter_role = serializers.CharField(source="reporter.role", read_only=True)
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )
    facilities_details = MedicalFacilitySerializer(
        source="facilities", many=True, read_only=True
    )
    acknowledged_by_name = serializers.CharField(
        source="acknowledged_by.get_full_name", read_only=True
    )

    class Meta:
        model = FacilityStatusReport
        fields = [
            "id",
            "reporter",
            "reporter_name",
            "reporter_role",
            "facilities",
            "facilities_details",
            "timestamp",
            "priority",
            "priority_display",
            "title",
            "description",
            "acknowledged",
            "acknowledged_by",
            "acknowledged_by_name",
            "acknowledged_at",
        ]
        read_only_fields = [
            "reporter",
            "acknowledged",
            "acknowledged_by",
            "acknowledged_at",
        ]

    def create(self, validated_data):
        # Set the reporter to the current user
        validated_data["reporter"] = self.context["request"].user
        return super().create(validated_data)
