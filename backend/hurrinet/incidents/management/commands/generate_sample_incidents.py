"""
Django management command to generate sample incidents for testing HurriNet.

This command creates sample incidents with various types, severities, and locations.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from incidents.models import Incident, IncidentUpdate
from django.utils import timezone
import random
from faker import Faker

User = get_user_model()
fake = Faker()

# Sample incident types
INCIDENT_TYPES = [
    "Flooding",
    "Landslide",
    "Road Blockage",
    "Power Outage",
    "Building Damage",
    "Fire",
    "Medical Emergency",
    "Water Shortage",
    "Fallen Tree",
    "Stranded Persons",
]

# Sample severity levels
SEVERITY_LEVELS = ["LOW", "MODERATE", "HIGH", "EXTREME"]

# Sample locations in Saint Lucia (longitude, latitude)
SAMPLE_LOCATIONS = [
    (-60.9832, 14.0101),  # Castries
    (-60.9498, 13.9957),  # Gros Islet
    (-61.0242, 13.8646),  # Soufriere
    (-60.9527, 13.7151),  # Vieux Fort
    (-60.9456, 13.9706),  # Rodney Bay
    (-60.9871, 13.8315),  # Anse La Raye
    (-61.0376, 13.9601),  # Canaries
    (-60.9527, 13.8646),  # Choiseul
    (-60.9456, 13.9101),  # Dennery
    (-60.9527, 13.8315),  # Laborie
]


class Command(BaseCommand):
    help = "Generate sample incidents for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="Number of incidents to generate (default: 20)",
        )

    def handle(self, *args, **options):
        count = options["count"]
        self.stdout.write(f"Generating {count} sample incidents...")

        # Get users for creating incidents
        try:
            users = list(User.objects.all())
            if not users:
                self.stdout.write(
                    self.style.WARNING(
                        "No users found. Please run create_test_users first."
                    )
                )
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error fetching users: {str(e)}"))
            return

        # Generate incidents
        incidents_created = 0
        for _ in range(count):
            try:
                # Select random data
                incident_type = random.choice(INCIDENT_TYPES)
                severity = random.choice(SEVERITY_LEVELS)
                location_coords = random.choice(SAMPLE_LOCATIONS)
                created_by = random.choice(users)

                # Create a title based on the incident type
                title = f"{incident_type} at {fake.street_name()}"

                # Create a description
                description = fake.paragraph(nb_sentences=5)

                # Create the incident
                incident = Incident.objects.create(
                    title=title,
                    description=description,
                    location=Point(location_coords[0], location_coords[1]),
                    incident_type=incident_type,
                    severity=severity,
                    created_by=created_by,
                    is_resolved=random.choice(
                        [True, False, False, False]
                    ),  # 25% chance of being resolved
                )

                # Add some updates to the incident
                num_updates = random.randint(0, 3)
                for i in range(num_updates):
                    update_content = fake.paragraph(nb_sentences=3)
                    IncidentUpdate.objects.create(
                        incident=incident,
                        author=random.choice(users),
                        content=update_content,
                    )

                # If incident is resolved, set resolved_by and resolved_at
                if incident.is_resolved:
                    incident.resolved_by = random.choice(users)
                    incident.resolved_at = timezone.now()
                    incident.save()

                incidents_created += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creating incident: {str(e)}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {incidents_created} sample incidents"
            )
        )
