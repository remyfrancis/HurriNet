from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Resource, InventoryItem, ResourceRequest, Distribution, Supplier


class ResourceSerializer(GeoFeatureModelSerializer):
    """Serializer for resources with geographic data"""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    resource_type_display = serializers.CharField(
        source="get_resource_type_display", read_only=True
    )

    class Meta:
        model = Resource
        geo_field = "location"
        fields = [
            "id",
            "name",
            "resource_type",
            "resource_type_display",
            "description",
            "status",
            "status_display",
            "capacity",
            "current_count",
            "current_workload",
            "address",
            "coverage_area",
            "assigned_to",
            "managed_by",
            "last_assignment_cost",
            "created_at",
            "updated_at",
        ]


class InventoryItemSerializer(serializers.ModelSerializer):
    """Serializer for inventory items"""

    resource_name = serializers.CharField(source="resource.name", read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "quantity",
            "unit",
            "capacity",
            "resource",
            "resource_name",
            "created_at",
            "updated_at",
        ]


class ResourceRequestSerializer(GeoFeatureModelSerializer):
    """Serializer for resource requests with geographic data"""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    resource_name = serializers.CharField(source="resource.name", read_only=True)
    requester_email = serializers.CharField(source="requester.email", read_only=True)

    class Meta:
        model = ResourceRequest
        geo_field = "location"
        fields = [
            "id",
            "resource",
            "resource_name",
            "item",
            "quantity",
            "requester",
            "requester_email",
            "status",
            "status_display",
            "priority",
            "created_at",
            "updated_at",
        ]


class DistributionSerializer(GeoFeatureModelSerializer):
    """Serializer for resource distributions with geographic data"""

    resource_name = serializers.CharField(source="resource.name", read_only=True)
    completion_rate = serializers.SerializerMethodField()

    class Meta:
        model = Distribution
        geo_field = "location"
        fields = [
            "id",
            "resource",
            "resource_name",
            "total_requests",
            "fulfilled_requests",
            "completion_rate",
            "distribution_area",
            "created_at",
            "updated_at",
        ]

    def get_completion_rate(self, obj):
        """Calculate the completion rate of distribution"""
        if obj.total_requests == 0:
            return 0
        return round((obj.fulfilled_requests / obj.total_requests) * 100, 2)


class SupplierSerializer(GeoFeatureModelSerializer):
    """Serializer for suppliers with geographic data"""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    supplier_type_display = serializers.CharField(
        source="get_supplier_type_display", read_only=True
    )
    supplied_items_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        geo_field = "location"
        fields = [
            "id",
            "name",
            "supplier_type",
            "supplier_type_display",
            "description",
            "contact_name",
            "email",
            "phone",
            "address",
            "website",
            "status",
            "status_display",
            "notes",
            "supplied_items_count",
            "created_at",
            "updated_at",
        ]

    def get_supplied_items_count(self, obj):
        """Get count of items supplied by this supplier"""
        return obj.supplied_items.count()
