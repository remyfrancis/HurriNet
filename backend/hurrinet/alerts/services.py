"""
Weather alert service for HurriNet.
This module integrates with the Tomorrow.io API to fetch real-time weather data
and generate weather alerts for different districts in Saint Lucia.
"""

import requests
from datetime import datetime
from django.conf import settings


class WeatherAlertService:
    """
    Service class for fetching and processing weather alerts.

    Integrates with Tomorrow.io's weather API to monitor weather conditions
    across different districts in Saint Lucia and generate appropriate alerts
    based on predefined thresholds.
    """

    def __init__(self):
        """
        Initialize the weather alert service.

        Sets up API credentials and defines geographical coordinates
        for major districts in Saint Lucia.
        """
        self.api_key = settings.TOMORROW_API_KEY
        self.base_url = "https://api.tomorrow.io/v4"

        # Geographical coordinates for major districts in Saint Lucia
        self.locations = {
            "Castries": {"lat": 14.0101, "lon": -60.9875},  # Capital city
            "Gros Islet": {"lat": 14.0722, "lon": -60.9498},  # Northern district
            "Soufriere": {"lat": 13.8566, "lon": -61.0564},  # Western district
            "Vieux Fort": {"lat": 13.7246, "lon": -60.9490},  # Southern district
        }

    def get_alerts(self):
        """
        Fetch real-time weather data and generate alerts for all monitored districts.

        Makes API calls to Tomorrow.io for each district and processes the weather data
        against predefined thresholds to generate appropriate alerts.

        Returns:
            list: List of dictionaries containing alert information for each detected
                 weather condition that exceeds defined thresholds.
        """
        alerts = []
        for district, coords in self.locations.items():
            url = f"{self.base_url}/weather/realtime"
            params = {
                "location": f"{coords['lat']},{coords['lon']}",
                "apikey": self.api_key,
                "units": "metric",  # Use metric system for measurements
            }

            try:
                # Fetch weather data from API
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                # Extract current weather values from response
                values = data["data"]["values"]

                # Check weather conditions against thresholds and generate alerts

                # Wind speed threshold: 15 m/s (54 km/h)
                if values["windSpeed"] > 15:
                    alerts.append(
                        {
                            "title": "High Wind Alert",
                            "type": "wind",
                            "severity": "High",
                            "district": district,
                            "active": True,
                        }
                    )

                # Precipitation intensity threshold: 7.6 mm/hr (heavy rain)
                if values["precipitationIntensity"] > 7.6:
                    alerts.append(
                        {
                            "title": "Heavy Rain Alert",
                            "type": "precipitation",
                            "severity": "Medium",
                            "district": district,
                            "active": True,
                        }
                    )

                # Temperature threshold: 32°C (89.6°F)
                if values["temperature"] > 32:
                    alerts.append(
                        {
                            "title": "High Temperature Alert",
                            "type": "temperature",
                            "severity": "Low",
                            "district": district,
                            "active": True,
                        }
                    )

            except Exception as e:
                # Log any errors encountered during API calls or data processing
                print(f"Error fetching weather data for {district}: {str(e)}")

        return alerts
