from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ['id', 'title', 'type', 'severity', 'district', 'active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']