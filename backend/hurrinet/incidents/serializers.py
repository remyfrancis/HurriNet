from rest_framework import serializers
from .models import Incident


class IncidentSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = [
            "tracking_id",
            "incident_type",
            "description",
            "latitude",
            "longitude",
            "photo",
            "photo_url",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["photo_url"]

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.photo.url)
        return None

    def create(self, validated_data):
        # Ensure tracking_id is included in creation
        if "tracking_id" not in validated_data:
            raise serializers.ValidationError(
                {"tracking_id": "This field is required"}
            )
        return super().create(validated_data)
