from rest_framework import serializers
from .models import Alert
from accounts.serializers import UserSerializer


class AlertSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "title",
            "type",
            "severity",
            "district",
            "active",
            "created_at",
            "updated_at",
            "created_by",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by"]
