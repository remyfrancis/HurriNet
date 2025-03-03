"""
Views for weather information in HurriNet.

This module provides views for accessing weather data, forecasts,
and weather alerts.
"""

from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import logging
from .models import WeatherData, WeatherForecast, WeatherAlert
from .serializers import (
    WeatherDataSerializer,
    WeatherForecastSerializer,
    WeatherAlertSerializer,
)

logger = logging.getLogger(__name__)


class WeatherViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for accessing weather information.

    Provides endpoints for:
    - Current weather conditions
    - Weather forecasts
    - Weather alerts
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get weather data based on the action."""
        if self.action == "current":
            return WeatherData.objects.all()
        elif self.action == "forecast":
            return WeatherForecast.objects.filter(date__gte=timezone.now().date())
        elif self.action == "alerts":
            return WeatherAlert.objects.filter(
                is_active=True, end_time__gt=timezone.now()
            )
        return WeatherData.objects.none()

    def get_serializer_class(self):
        """Return appropriate serializer based on the action."""
        if self.action == "current":
            return WeatherDataSerializer
        elif self.action == "forecast":
            return WeatherForecastSerializer
        elif self.action == "alerts":
            return WeatherAlertSerializer
        return WeatherDataSerializer

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current weather conditions."""
        try:
            # Fetch fresh data from Tomorrow.io
            weather = WeatherData.fetch_from_tomorrow()
            if not weather:
                # If fetch fails, get latest from database
                weather = WeatherData.objects.latest()

            serializer = self.get_serializer(weather)
            return Response(serializer.data)
        except WeatherData.DoesNotExist:
            return Response(
                {"error": "No weather data available"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def forecast(self, request):
        """Get weather forecast for the next 7 days."""
        try:
            # Fetch fresh forecast from Tomorrow.io
            logger.info("Fetching forecast from Tomorrow.io")
            forecasts = WeatherForecast.fetch_from_tomorrow()

            if not forecasts:
                logger.warning(
                    "No forecasts returned from Tomorrow.io, falling back to database"
                )
                # If fetch fails, get from database
                forecasts = self.get_queryset()
                if not forecasts.exists():
                    logger.warning("No forecasts found in database")
                    return Response(
                        {"error": "No weather forecast available"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            serializer = self.get_serializer(forecasts, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in forecast endpoint: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch weather forecast"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"])
    def alerts(self, request):
        """Get active weather alerts."""
        alerts = self.get_queryset()
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_location(self, request):
        """Get weather data for a specific location."""
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        location = request.query_params.get("location", "Saint Lucia")

        if not lat or not lng:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Fetch fresh data from Tomorrow.io for the location
            weather = WeatherData.fetch_from_tomorrow(
                lat=float(lat), lng=float(lng), location=location
            )
            if not weather:
                # If fetch fails, get latest from database
                weather = WeatherData.objects.filter(
                    latitude=lat, longitude=lng
                ).latest()

            serializer = WeatherDataSerializer(weather)
            return Response(serializer.data)
        except WeatherData.DoesNotExist:
            return Response(
                {"error": "No weather data available for this location"},
                status=status.HTTP_404_NOT_FOUND,
            )
