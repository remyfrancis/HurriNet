"""
Models for weather information in HurriNet.

This module defines models for storing weather data including
current conditions and forecasts.
"""

from django.db import models
from django.utils import timezone
import requests
from django.conf import settings
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


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

    @classmethod
    def fetch_from_tomorrow(cls, lat=13.9094, lng=-60.9789, location="Saint Lucia"):
        """Fetch weather data from Tomorrow.io API."""
        api_key = settings.TOMORROW_API_KEY
        logger.info(f"Using Tomorrow.io API key: {api_key[:5]}...")

        # Construct URL with parameters directly
        url = f"https://api.tomorrow.io/v4/weather/realtime?location={lat},{lng}&apikey={api_key}&fields=temperature,temperatureApparent,humidity,windSpeed,windDirection,cloudCover,visibility,pressureSurfaceLevel,precipitationProbability"

        try:
            logger.info(f"Making request to Tomorrow.io API for {location}")
            logger.info(f"Request URL: {url}")
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            logger.info("Successfully received response from Tomorrow.io API")

            # Map Tomorrow.io conditions to our choices
            condition_mapping = {
                "clear": "SUNNY",
                "partlyCloudy": "PARTLY_CLOUDY",
                "cloudy": "CLOUDY",
                "rain": "RAIN",
                "storm": "STORM",
                "hurricane": "HURRICANE",
            }

            values = data["data"]["values"]

            # Create weather data with default values for missing fields
            weather_data = {
                "temperature": values.get("temperature", 0),
                "feels_like": values.get(
                    "temperatureApparent", values.get("temperature", 0)
                ),
                "humidity": values.get("humidity", 0),
                "wind_speed": values.get("windSpeed", 0),
                "wind_direction": values.get("windDirection", 0),
                "conditions": condition_mapping.get(
                    "cloudy" if values.get("cloudCover", 0) > 50 else "clear", "SUNNY"
                ),
                "pressure": values.get(
                    "pressureSurfaceLevel", 1013.25
                ),  # Default sea level pressure
                "visibility": values.get("visibility", 10),  # Default good visibility
                "location": location,
                "latitude": lat,
                "longitude": lng,
            }

            weather = cls.objects.create(**weather_data)
            logger.info(f"Successfully created weather data for {location}")
            return weather
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to Tomorrow.io API: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error processing weather data: {str(e)}", exc_info=True)
            return None


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

    @classmethod
    def fetch_from_tomorrow(cls, lat=13.9094, lng=-60.9789, location="Saint Lucia"):
        """Fetch weather forecast from Tomorrow.io API."""
        api_key = settings.TOMORROW_API_KEY
        logger.info(
            f"Using Tomorrow.io API key: {api_key[:5]}..."
        )  # Only log first 5 chars for security

        # Construct URL with parameters directly
        url = f"https://api.tomorrow.io/v4/weather/forecast?location={lat},{lng}&apikey={api_key}&timesteps=1d&fields=temperature,humidity,windSpeed,precipitationProbability"

        try:
            logger.info(f"Making request to Tomorrow.io API for forecast in {location}")
            logger.info(f"Request URL: {url}")
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            logger.info("Successfully received forecast response from Tomorrow.io API")

            # Log the response structure for debugging
            logger.info(f"Response data structure: {data}")

            forecasts = []
            for daily in data["timelines"]["daily"][:7]:  # Get 7 days forecast
                date = datetime.strptime(daily["time"], "%Y-%m-%dT%H:%M:%SZ").date()

                # Map Tomorrow.io conditions to our choices
                condition_mapping = {
                    "clear": "SUNNY",
                    "partlyCloudy": "PARTLY_CLOUDY",
                    "cloudy": "CLOUDY",
                    "rain": "RAIN",
                    "storm": "STORM",
                    "hurricane": "HURRICANE",
                }

                # Get the values from the response
                values = daily["values"]
                forecast_data = {
                    "date": date,
                    "high_temp": values.get(
                        "temperatureMax", values.get("temperature")
                    ),  # Fallback to temperature if max not available
                    "low_temp": values.get(
                        "temperatureMin", values.get("temperature")
                    ),  # Fallback to temperature if min not available
                    "conditions": condition_mapping.get(
                        values.get("cloudCover", "clear"), "SUNNY"
                    ),
                    "precipitation_chance": values.get(
                        "precipitationProbability", 0
                    ),  # Default to 0 if not available
                    "wind_speed": values.get(
                        "windSpeedAvg", values.get("windSpeed", 0)
                    ),  # Try windSpeedAvg first, then windSpeed, default to 0
                    "humidity": values.get(
                        "humidity", 0
                    ),  # Default to 0 if not available
                    "location": location,
                }

                forecast, created = cls.objects.update_or_create(
                    date=date, location=location, defaults=forecast_data
                )
                forecasts.append(forecast)
                logger.info(f"Created/updated forecast for {date} in {location}")

            return forecasts
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to Tomorrow.io API: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error processing forecast data: {str(e)}", exc_info=True)
            return []


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
