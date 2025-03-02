"""
URL configuration for the weather app.

This module defines the URL patterns for weather-related endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherViewSet

# Create a router and register our viewset with it
router = DefaultRouter()
router.register(r"", WeatherViewSet, basename="weather")

# URL patterns for weather endpoints:
# - GET /api/weather/current/ (current weather)
# - GET /api/weather/forecast/ (weather forecast)
# - GET /api/weather/alerts/ (weather alerts)
# - GET /api/weather/by-location/?lat=&lng= (weather by location)
urlpatterns = [
    path("", include(router.urls)),
]
