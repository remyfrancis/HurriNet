#!/usr/bin/env python
"""
Script to generate sample alerts for testing purposes.
Run this script from the project root directory.
"""
import os
import sys
import django
import argparse
import random

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

# Import Django models after setting up the environment
from django.contrib.auth import get_user_model
from alerts.models import Alert

User = get_user_model()


def generate_alerts(count=10, active_only=False):
    """Generate sample alerts for testing."""
    # Get admin user
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("No superuser found. Please create one first.")
        return

    # Sample alert data
    alert_types = [
        {
            "title": "Hurricane Warning",
            "description": "A hurricane is expected to make landfall within 24 hours. Take immediate precautions.",
            "severity": "EXTREME",
            "instructions": "Evacuate low-lying areas. Secure your property. Gather emergency supplies.",
            "affected_areas": "Coastal regions, flood-prone areas",
        },
        {
            "title": "Tropical Storm Watch",
            "description": "A tropical storm may affect the area within 48 hours.",
            "severity": "HIGH",
            "instructions": "Prepare emergency supplies. Monitor weather updates.",
            "affected_areas": "All coastal areas",
        },
        {
            "title": "Flash Flood Warning",
            "description": "Heavy rainfall is causing flash flooding in the area.",
            "severity": "HIGH",
            "instructions": "Avoid flooded areas. Do not attempt to cross flowing water.",
            "affected_areas": "Low-lying areas, river banks",
        },
        {
            "title": "High Wind Advisory",
            "description": "Strong winds expected with gusts up to 50 mph.",
            "severity": "MODERATE",
            "instructions": "Secure loose outdoor items. Be cautious when driving.",
            "affected_areas": "Exposed areas, coastal regions",
        },
        {
            "title": "Heavy Rain Alert",
            "description": "Periods of heavy rain expected over the next 12 hours.",
            "severity": "MODERATE",
            "instructions": "Drive with caution. Check drainage systems.",
            "affected_areas": "All districts",
        },
        {
            "title": "Coastal Erosion Notice",
            "description": "Ongoing coastal erosion affecting beachfront properties.",
            "severity": "LOW",
            "instructions": "Avoid affected beaches. Report significant changes.",
            "affected_areas": "Coastal properties",
        },
        {
            "title": "Heat Advisory",
            "description": "Temperatures expected to exceed 32°C (90°F) for extended periods.",
            "severity": "LOW",
            "instructions": "Stay hydrated. Limit outdoor activities during peak heat.",
            "affected_areas": "All districts",
        },
    ]

    # Create sample alerts
    created_count = 0
    for i in range(count):
        alert_template = random.choice(alert_types)
        district = random.choice([choice[0] for choice in Alert.DISTRICT_CHOICES])
        is_active = True if active_only else random.choice([True, False])

        # Create the alert
        try:
            alert = Alert.objects.create(
                title=alert_template["title"],
                description=alert_template["description"],
                severity=alert_template["severity"],
                district=district,
                created_by=admin_user,
                is_active=is_active,
                is_public=random.choice([True, False]) if not is_active else True,
                affected_areas=alert_template["affected_areas"],
                instructions=alert_template["instructions"],
            )
            created_count += 1
            print(
                f"Created alert: {alert.title} - {alert.get_severity_display()} - {alert.district}"
            )
        except Exception as e:
            print(f"Error creating alert: {str(e)}")

    print(f"Successfully created {created_count} sample alerts")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sample alerts for testing")
    parser.add_argument(
        "--count", type=int, default=10, help="Number of alerts to generate"
    )
    parser.add_argument(
        "--active", action="store_true", help="Generate only active alerts"
    )

    args = parser.parse_args()
    generate_alerts(count=args.count, active_only=args.active)
