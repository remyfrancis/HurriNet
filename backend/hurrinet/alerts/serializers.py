from rest_framework import serializers
from .models import Alert
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class AlertSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "title",
            "description",
            "severity",
            "severity_display",
            "created_by",
            "created_at",
            "updated_at",
            "is_active",
            "is_public",
            "affected_areas",
            "instructions",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
