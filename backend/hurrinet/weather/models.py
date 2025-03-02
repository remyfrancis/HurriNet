"""
Models for weather information in HurriNet.

This module defines models for storing weather data including
current conditions and forecasts.
"""

from django.db import models
from django.utils import timezone


class WeatherData(models.Model):
    """Model for storing current weather conditions."""

    CONDITION_CHOICES = [
        ("SUNNY", "Sunny"),
        ("PARTLY_CLOUDY", "Partly Cloudy"),
        ("CLOUDY", "Cloudy"),
        ("RAIN", "Rain"),
        ("STORM", "Storm"),
        ("HURRICANE", "Hurricane"),
    ]

    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    feels_like = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.IntegerField()
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    wind_direction = models.IntegerField()  # in degrees
    conditions = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    pressure = models.DecimalField(max_digits=6, decimal_places=2)
    visibility = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        ordering = ["-timestamp"]
        get_latest_by = "timestamp"

    def __str__(self):
        return f"{self.conditions} at {self.location} ({self.timestamp})"


class WeatherForecast(models.Model):
    """Model for storing weather forecasts."""

    date = models.DateField()
    high_temp = models.DecimalField(max_digits=5, decimal_places=2)
    low_temp = models.DecimalField(max_digits=5, decimal_places=2)
    conditions = models.CharField(max_length=20, choices=WeatherData.CONDITION_CHOICES)
    precipitation_chance = models.IntegerField()
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.IntegerField()
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date"]
        unique_together = ["date", "location"]

    def __str__(self):
        return f"Forecast for {self.location} on {self.date}"


class WeatherAlert(models.Model):
    """Model for storing weather alerts and warnings."""

    ALERT_TYPES = [
        ("HURRICANE_WATCH", "Hurricane Watch"),
        ("HURRICANE_WARNING", "Hurricane Warning"),
        ("FLOOD_WATCH", "Flood Watch"),
        ("FLOOD_WARNING", "Flood Warning"),
        ("SEVERE_WEATHER", "Severe Weather"),
        ("TORNADO_WATCH", "Tornado Watch"),
        ("TORNADO_WARNING", "Tornado Warning"),
    ]

    SEVERITY_LEVELS = [
        ("LOW", "Low"),
        ("MODERATE", "Moderate"),
        ("HIGH", "High"),
        ("EXTREME", "Extreme"),
    ]

    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    title = models.CharField(max_length=255)
    description = models.TextField()
    area_affected = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.alert_type} - {self.title}"
