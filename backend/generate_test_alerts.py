#!/usr/bin/env python
"""
Script to generate test weather alerts for the HurriNet application.

This script creates sample weather alerts of different types and severity levels
for testing the alert system.

Usage:
    python generate_test_alerts.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
django.setup()

# Check if weather app is available
from django.conf import settings

if "weather" not in [app.split(".")[-1] for app in settings.INSTALLED_APPS]:
    print("Weather app is not installed. Cannot generate weather alerts.")
    sys.exit(1)

from weather.models import WeatherAlert


def create_test_alerts():
    """Create test weather alerts of various types and severity levels."""

    # Clear existing alerts
    WeatherAlert.objects.all().delete()
    print("Cleared existing alerts.")

    # Current time for reference
    now = datetime.now()

    # Define test alerts
    test_alerts = [
        {
            "alert_type": "HURRICANE_WATCH",
            "severity": "MODERATE",
            "title": "Hurricane Watch: Tropical Storm Approaching",
            "description": "A tropical storm has formed in the Atlantic and may develop into a hurricane. "
            "Residents should monitor updates and review hurricane preparedness plans.",
            "area_affected": "All of Saint Lucia",
            "start_time": now,
            "end_time": now + timedelta(days=3),
        },
        {
            "alert_type": "HURRICANE_WARNING",
            "severity": "HIGH",
            "title": "Hurricane Warning: Category 2 Hurricane Expected",
            "description": "A Category 2 hurricane is expected to impact Saint Lucia within 36 hours. "
            "Prepare for strong winds, heavy rainfall, and possible flooding. "
            "Follow evacuation orders if issued for your area.",
            "area_affected": "All coastal areas of Saint Lucia",
            "start_time": now,
            "end_time": now + timedelta(days=2),
        },
        {
            "alert_type": "FLOOD_WATCH",
            "severity": "MODERATE",
            "title": "Flood Watch: Heavy Rainfall Expected",
            "description": "Heavy rainfall is expected over the next 24-48 hours, which may lead to flooding "
            "in low-lying areas and near rivers and streams.",
            "area_affected": "Central and Eastern regions of Saint Lucia",
            "start_time": now,
            "end_time": now + timedelta(days=1),
        },
        {
            "alert_type": "FLOOD_WARNING",
            "severity": "HIGH",
            "title": "Flood Warning: Immediate Action Required",
            "description": "Flooding is occurring or imminent in the affected areas. "
            "Residents in low-lying areas should move to higher ground immediately.",
            "area_affected": "Castries and surrounding areas",
            "start_time": now,
            "end_time": now + timedelta(hours=12),
        },
        {
            "alert_type": "SEVERE_WEATHER",
            "severity": "MODERATE",
            "title": "Severe Weather Alert: Thunderstorms",
            "description": "Severe thunderstorms with lightning, strong winds, and possible hail "
            "are expected in the affected areas.",
            "area_affected": "Southern Saint Lucia",
            "start_time": now,
            "end_time": now + timedelta(hours=6),
        },
    ]

    # Create alerts
    created_alerts = []
    for alert_data in test_alerts:
        try:
            alert = WeatherAlert.objects.create(**alert_data)
            created_alerts.append(alert)
            print(f"Created {alert.alert_type} alert: {alert.title}")
        except Exception as e:
            print(f"Error creating alert {alert_data['title']}: {str(e)}")

    return created_alerts


if __name__ == "__main__":
    print("Generating test weather alerts for HurriNet...")
    alerts = create_test_alerts()
    print(f"Created {len(alerts)} test alerts.")
