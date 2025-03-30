from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    Resource,
    InventoryItem,
    ResourceRequest,
    Distribution,
    Supplier,
    Transfer,
)


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
    item_type_display = serializers.CharField(
        source="get_item_type_display", read_only=True
    )

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "item_type",
            "item_type_display",
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


class StockLevelSerializer(serializers.Serializer):
    """Serializer for stock level data"""

    quantity = serializers.IntegerField()
    capacity = serializers.IntegerField()
    status = serializers.CharField()
    percentage = serializers.FloatField()


class LocationStockLevelSerializer(GeoFeatureModelSerializer):
    """Serializer for location-based stock levels"""

    stock_levels = serializers.DictField(
        child=StockLevelSerializer(),
        help_text="Dictionary of item types and their stock levels",
    )

    class Meta:
        model = Resource
        geo_field = "location"
        fields = ["id", "name", "address", "stock_levels"]


class AggregatedStockLocationSerializer(serializers.Serializer):
    """Serializer for individual location data in aggregated stock levels"""

    resource_id = serializers.IntegerField()
    resource_name = serializers.CharField()
    quantity = serializers.IntegerField()
    capacity = serializers.IntegerField()
    status = serializers.CharField()


class AggregatedStockLevelSerializer(serializers.Serializer):
    """Serializer for aggregated stock levels by item type"""

    type_display = serializers.CharField()
    total_quantity = serializers.IntegerField()
    total_capacity = serializers.IntegerField()
    percentage = serializers.FloatField()
    status = serializers.CharField()
    locations = AggregatedStockLocationSerializer(many=True)


class TransferSerializer(serializers.ModelSerializer):
    """Serializer for inventory transfers"""

    item = serializers.CharField(source="item.name")
    source = serializers.CharField(source="source.name")
    destination = serializers.CharField(source="destination.name")
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Transfer
        fields = [
            "id",
            "item",
            "source",
            "destination",
            "quantity",
            "status",
            "status_display",
            "notes",
            "created_at",
            "completed_at",
        ]

    def create(self, validated_data):
        item_name = validated_data.pop("item")["name"]
        source_name = validated_data.pop("source")["name"]
        destination_name = validated_data.pop("destination")["name"]

        try:
            item = InventoryItem.objects.get(name=item_name)
            source = Resource.objects.get(name=source_name)
            destination = Resource.objects.get(name=destination_name)

            if item.quantity < validated_data["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient quantity. Available: {item.quantity}"
                )

            transfer = Transfer.objects.create(
                item=item, source=source, destination=destination, **validated_data
            )

            return transfer

        except InventoryItem.DoesNotExist:
            raise serializers.ValidationError(f"Item '{item_name}' not found")
        except Resource.DoesNotExist as e:
            name = source_name if "source" in str(e) else destination_name
            raise serializers.ValidationError(f"Resource '{name}' not found")
