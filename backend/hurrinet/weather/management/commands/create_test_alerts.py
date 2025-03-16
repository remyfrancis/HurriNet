from django.core.management.base import BaseCommand
from weather.models import WeatherAlert
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = "Creates test weather alerts of various types and severity levels"

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("Generating test weather alerts for HurriNet...")
        )

        # Clear existing alerts
        WeatherAlert.objects.all().delete()
        self.stdout.write("Cleared existing alerts.")

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
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created {alert.alert_type} alert: {alert.title}"
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"Error creating alert {alert_data['title']}: {str(e)}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"Created {len(created_alerts)} test alerts.")
        )
