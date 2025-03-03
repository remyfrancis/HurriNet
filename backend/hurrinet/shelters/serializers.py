from rest_framework import serializers
from .models import Shelter


class ShelterSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Shelter
        fields = [
            "id",
            "name",
            "address",
            "latitude",
            "longitude",
            "capacity",
            "current_occupancy",
            "status",
            "status_display",
            "description",
            "facilities",
            "contact_number",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
