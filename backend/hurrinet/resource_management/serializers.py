from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Resource, InventoryItem, ResourceRequest, Distribution, Supplier


class ResourceMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for resource references"""

    resource_type = serializers.CharField(source="get_resource_type_display")

    class Meta:
        model = Resource
        fields = ["id", "name", "resource_type"]


class SupplierMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for supplier references"""

    class Meta:
        model = Supplier
        fields = ["id", "name"]


class ResourceSerializer(GeoFeatureModelSerializer):
    """Serializer for resources with geographic data"""

    resource_type = serializers.CharField(source="get_resource_type_display")
    status = serializers.CharField(source="get_status_display")
    location = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        geo_field = "location"
        fields = [
            "id",
            "name",
            "resource_type",
            "description",
            "status",
            "capacity",
            "current_count",
            "current_workload",
            "location",
            "address",
        ]

    def get_location(self, obj):
        if obj.location:
            return [obj.location.x, obj.location.y]  # Returns [longitude, latitude]
        return None


class InventoryItemSerializer(serializers.ModelSerializer):
    """Serializer for inventory items"""

    resource = ResourceMinimalSerializer()
    supplier = SupplierMinimalSerializer()
    resource_name = serializers.CharField(source="resource.name", read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "quantity",
            "capacity",
            "unit",
            "resource",
            "resource_name",
            "supplier",
        ]


class ResourceRequestSerializer(serializers.ModelSerializer):
    """Serializer for resource requests"""

    item = serializers.CharField(source="item.name")
    supplier = serializers.CharField(source="supplier.name")
    destination = serializers.CharField(source="resource.name", read_only=True)

    class Meta:
        model = ResourceRequest
        fields = [
            "id",
            "item",
            "quantity",
            "supplier",
            "status",
            "destination",
        ]

    def create(self, validated_data):
        item_name = validated_data.pop("item")["name"]
        supplier_name = validated_data.pop("supplier")["name"]

        item = InventoryItem.objects.get(name=item_name)
        supplier = Supplier.objects.get(name=supplier_name)

        return ResourceRequest.objects.create(
            item=item, supplier=supplier, **validated_data
        )


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

    supplier_type_display = serializers.CharField(source="get_supplier_type_display")
    status_display = serializers.CharField(source="get_status_display")

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
            "created_at",
            "updated_at",
        ]
