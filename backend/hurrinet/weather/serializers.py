"""
Serializers for weather information in HurriNet.

This module provides serializers for converting weather models to/from JSON.
"""

from rest_framework import serializers
from .models import WeatherData, WeatherForecast, WeatherAlert


class WeatherDataSerializer(serializers.ModelSerializer):
    """Serializer for current weather conditions."""

    conditions_display = serializers.CharField(
        source="get_conditions_display", read_only=True
    )

    class Meta:
        model = WeatherData
        fields = (
            "id",
            "temperature",
            "feels_like",
            "humidity",
            "wind_speed",
            "wind_direction",
            "conditions",
            "conditions_display",
            "pressure",
            "visibility",
            "timestamp",
            "location",
            "latitude",
            "longitude",
        )


class WeatherForecastSerializer(serializers.ModelSerializer):
    """Serializer for weather forecasts."""

    conditions_display = serializers.CharField(
        source="get_conditions_display", read_only=True
    )

    class Meta:
        model = WeatherForecast
        fields = (
            "id",
            "date",
            "high_temp",
            "low_temp",
            "conditions",
            "conditions_display",
            "precipitation_chance",
            "wind_speed",
            "humidity",
            "location",
            "created_at",
            "updated_at",
        )


class WeatherAlertSerializer(serializers.ModelSerializer):
    """Serializer for weather alerts."""

    alert_type_display = serializers.CharField(
        source="get_alert_type_display", read_only=True
    )
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )

    class Meta:
        model = WeatherAlert
        fields = (
            "id",
            "alert_type",
            "alert_type_display",
            "severity",
            "severity_display",
            "title",
            "description",
            "area_affected",
            "start_time",
            "end_time",
            "created_at",
            "updated_at",
            "is_active",
        )
