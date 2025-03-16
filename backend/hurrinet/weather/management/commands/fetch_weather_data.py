from django.core.management.base import BaseCommand
from weather.models import WeatherData, WeatherForecast


class Command(BaseCommand):
    help = "Fetches current weather and forecast data from Tomorrow.io API"

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("Fetching weather data from Tomorrow.io API...")
        )

        # Fetch current weather data
        self.stdout.write("Fetching current weather data...")
        try:
            weather = WeatherData.fetch_from_tomorrow()
            if weather:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully fetched current weather data: {weather}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING("Failed to fetch current weather data")
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error fetching current weather data: {str(e)}")
            )

        # Fetch weather forecast data
        self.stdout.write("\nFetching weather forecast data...")
        try:
            forecasts = WeatherForecast.fetch_from_tomorrow()
            if forecasts:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully fetched {len(forecasts)} days of forecast data"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING("Failed to fetch weather forecast data")
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error fetching weather forecast data: {str(e)}")
            )
