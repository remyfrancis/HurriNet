"""
Django management command to generate sample data for testing HurriNet.

This command creates sample users, feed posts, and incidents for testing purposes.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point, Polygon
from feed.models import FeedPost
from incidents.models import Incident
from django.utils import timezone
import random
from faker import Faker

User = get_user_model()
fake = Faker()


def generate_phone():
    """Generate a phone number of appropriate length."""
    return f"+1{fake.numerify(text='##########')}"


class Command(BaseCommand):
    help = "Generates sample data for testing HurriNet"

    def add_arguments(self, parser):
        parser.add_argument(
            "--posts", type=int, default=20, help="Number of feed posts to create"
        )
        parser.add_argument(
            "--incidents", type=int, default=15, help="Number of incidents to create"
        )

    def handle(self, *args, **options):
        num_posts = options["posts"]
        num_incidents = options["incidents"]

        self.stdout.write("Creating sample data...")

        # Get existing users
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                self.style.ERROR(
                    "No users found in database. Please create users first."
                )
            )
            return

        # Create sample feed posts
        post_types = ["UPDATE", "HELP_REQUEST", "OFFER_HELP", "INFO", "WARNING"]
        for _ in range(num_posts):
            author = random.choice(users)
            post = FeedPost.objects.create(
                author=author,
                content=fake.paragraph(),
                post_type=random.choice(post_types),
                location=fake.city(),
                latitude=float(fake.latitude()),
                longitude=float(fake.longitude()),
                is_verified=random.choice([True, False]),
                verified_by=random.choice(users) if random.random() > 0.7 else None,
            )
            self.stdout.write(
                f"Created feed post: {post.post_type} by {post.author.email}"
            )

        # Create sample incidents
        severity_choices = ["LOW", "MODERATE", "HIGH", "EXTREME"]
        incident_types = ["HURRICANE", "FLOOD", "FIRE", "EARTHQUAKE", "TORNADO"]

        for _ in range(num_incidents):
            # Create a point for the incident location
            point = Point(float(fake.longitude()), float(fake.latitude()), srid=4326)

            # Create a simple polygon around the point for the affected area
            coords = [
                [point.x - 0.1, point.y - 0.1],
                [point.x + 0.1, point.y - 0.1],
                [point.x + 0.1, point.y + 0.1],
                [point.x - 0.1, point.y + 0.1],
                [point.x - 0.1, point.y - 0.1],
            ]
            polygon = Polygon(coords, srid=4326)

            incident = Incident.objects.create(
                title=fake.sentence(),
                description=fake.paragraph(),
                location=point,
                affected_area=polygon,
                incident_type=random.choice(incident_types),
                severity=random.choice(severity_choices),
                created_by=random.choice(users),
                is_resolved=random.choice([True, False]),
            )

            if incident.is_resolved:
                incident.resolved_at = timezone.now()
                incident.resolved_by = random.choice(users)
                incident.save()

            self.stdout.write(f"Created incident: {incident.title}")

        self.stdout.write(
            self.style.SUCCESS(
                f"""
Successfully created:
- {num_posts} feed posts
- {num_incidents} incidents
"""
            )
        )
