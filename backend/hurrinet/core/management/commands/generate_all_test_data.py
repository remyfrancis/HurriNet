from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings


class Command(BaseCommand):
    help = "Runs all test data generation commands in the correct order"

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("Generating all test data for HurriNet...")
        )

        # Get available apps
        available_apps = [app.split(".")[-1] for app in settings.INSTALLED_APPS]
        self.stdout.write(f"Available apps: {available_apps}")

        # Step 1: Create test users
        if "accounts" in available_apps or "AccountsConfig" in available_apps:
            self.stdout.write(self.style.NOTICE("\nStep 1: Creating test users..."))
            call_command("create_test_users")
        else:
            self.stdout.write(
                self.style.WARNING("\nSkipping user creation - accounts app not found")
            )

        # Step 2: Create test weather alerts
        if "weather" in available_apps:
            self.stdout.write(
                self.style.NOTICE("\nStep 2: Creating test weather alerts...")
            )
            call_command("create_test_alerts")
        else:
            self.stdout.write(
                self.style.WARNING("\nSkipping weather alerts - weather app not found")
            )

        # Step 3: Create test emergency alerts
        if "alerts" in available_apps:
            self.stdout.write(
                self.style.NOTICE("\nStep 3: Creating test emergency alerts...")
            )
            call_command("generate_sample_alerts")
        else:
            self.stdout.write(
                self.style.WARNING("\nSkipping emergency alerts - alerts app not found")
            )

        # Step 4: Create test incidents
        if "incidents" in available_apps:
            self.stdout.write(self.style.NOTICE("\nStep 4: Creating test incidents..."))
            call_command("generate_sample_incidents")
        else:
            self.stdout.write(
                self.style.WARNING("\nSkipping incidents - incidents app not found")
            )

        # Step 5: Fetch weather data
        if "weather" in available_apps:
            self.stdout.write(self.style.NOTICE("\nStep 5: Fetching weather data..."))
            call_command("fetch_weather_data")
        else:
            self.stdout.write(
                self.style.WARNING("\nSkipping weather data - weather app not found")
            )

        # Step 6: Create test feed posts
        if "feed" in available_apps:
            self.stdout.write(
                self.style.NOTICE("\nStep 6: Creating test feed posts...")
            )
            call_command("generate_sample_data")
        else:
            self.stdout.write(
                self.style.WARNING("\nSkipping feed posts - feed app not found")
            )

        self.stdout.write(self.style.SUCCESS("\nAll test data generation complete!"))

        # Print test user credentials
        if "accounts" in available_apps or "AccountsConfig" in available_apps:
            self.stdout.write("\nTest User Credentials:")
            self.stdout.write("======================")
            for user_data in [
                {
                    "role": "ADMINISTRATOR",
                    "email": "admin@hurrinet.org",
                    "password": "Admin123!",
                },
                {
                    "role": "CITIZEN",
                    "email": "citizen@hurrinet.org",
                    "password": "Citizen123!",
                },
                {
                    "role": "EMERGENCY_PERSONNEL",
                    "email": "emergency@hurrinet.org",
                    "password": "Emergency123!",
                },
                {
                    "role": "RESOURCE_MANAGER",
                    "email": "resource@hurrinet.org",
                    "password": "Resource123!",
                },
                {
                    "role": "MEDICAL_PERSONNEL",
                    "email": "medical@hurrinet.org",
                    "password": "Medical123!",
                },
            ]:
                self.stdout.write(f"{user_data['role']}:")
                self.stdout.write(f"  Email: {user_data['email']}")
                self.stdout.write(f"  Password: {user_data['password']}")
                self.stdout.write("")
