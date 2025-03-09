from rest_framework import serializers
from .models import InventoryItem, ResourceRequest, Distribution


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ["id", "name", "quantity", "unit", "capacity"]


class ResourceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceRequest
        fields = ["id", "item", "quantity", "location", "status"]


class DistributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribution
        fields = ["id", "location", "total_requests", "fulfilled_requests"]
