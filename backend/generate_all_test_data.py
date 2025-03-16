#!/usr/bin/env python
"""
Master script to generate all test data for the HurriNet application.

This script runs all the individual data generation scripts in the correct order:
1. Generate test users
2. Generate weather data
3. Generate weather alerts
4. Generate incidents
5. Generate community feed posts

Usage:
    python generate_all_test_data.py
"""

import os
import sys
import subprocess
import time

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")

# Import Django after setting the environment
import django

django.setup()

# Check which apps are available
from django.conf import settings

AVAILABLE_APPS = [app.split(".")[-1] for app in settings.INSTALLED_APPS]
print(f"Available apps: {AVAILABLE_APPS}")


def run_script(script_name):
    """Run a Python script and return its output."""
    print(f"\n{'='*50}")
    print(f"Running {script_name}...")
    print(f"{'='*50}\n")

    result = subprocess.run(
        [sys.executable, script_name], capture_output=True, text=True
    )

    print(result.stdout)

    if result.stderr:
        print(f"Errors:\n{result.stderr}")

    return result.returncode == 0


def generate_all_test_data():
    """Generate all test data for the HurriNet application."""

    # It's better to use the Django management command directly
    print("\n" + "=" * 50)
    print("Running Django management command to generate all test data...")
    print("=" * 50 + "\n")

    try:
        from django.core.management import call_command

        call_command("generate_all_test_data")
        return 1, 1  # Success
    except Exception as e:
        print(f"Error running management command: {str(e)}")

        # Fallback to individual scripts if management command fails
        print("\nFalling back to individual scripts...")

        scripts = [
            "generate_test_users.py",
            "generate_test_alerts.py",
        ]

        # Add the feed script if the feed app is available
        if "feed" in AVAILABLE_APPS:
            scripts.append("generate_sample_data.py")
        else:
            print("Feed app not found, skipping feed generation")

        # Add the incidents script if the incidents app is available
        if "incidents" in AVAILABLE_APPS:
            scripts.append("generate_sample_incidents.py")
        else:
            print("Incidents app not found, skipping incident generation")

        success_count = 0

        for script in scripts:
            if run_script(script):
                success_count += 1
            else:
                print(f"Failed to run {script}")

            # Small delay between scripts
            time.sleep(1)

        # Fetch weather data from API
        print("\n" + "=" * 50)
        print("Fetching weather data from Tomorrow.io API...")
        print("=" * 50 + "\n")

        try:
            from weather.models import WeatherData, WeatherForecast

            print("Fetching current weather data...")
            weather = WeatherData.fetch_from_tomorrow()
            if weather:
                print(f"Successfully fetched current weather data: {weather}")
            else:
                print("Failed to fetch current weather data")

            print("\nFetching weather forecast data...")
            forecasts = WeatherForecast.fetch_from_tomorrow()
            if forecasts:
                print(f"Successfully fetched {len(forecasts)} days of forecast data")
            else:
                print("Failed to fetch weather forecast data")

            success_count += 1
        except Exception as e:
            print(f"Error fetching weather data: {str(e)}")

        return success_count, len(scripts) + 1  # +1 for weather data fetch


if __name__ == "__main__":
    print("Generating all test data for HurriNet...")
    success_count, total_count = generate_all_test_data()

    print("\n" + "=" * 50)
    print(f"Test data generation complete: {success_count}/{total_count} successful")
    print("=" * 50)

    if success_count == total_count:
        print("\nAll test data was generated successfully!")
    else:
        print(
            "\nSome data generation tasks failed. Check the output above for details."
        )

    print("\nTest User Credentials:")
    print("======================")
    for user_data in [
        {
            "role": "ADMINISTRATOR",
            "email": "admin@hurrinet.org",
            "password": "Admin123!",
        },
        {"role": "CITIZEN", "email": "citizen@hurrinet.org", "password": "Citizen123!"},
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
        print(f"{user_data['role']}:")
        print(f"  Email: {user_data['email']}")
        print(f"  Password: {user_data['password']}")
        print()
