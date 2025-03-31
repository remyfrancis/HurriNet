"""
URL configuration for the Alerts application.

This module defines the URL routing patterns for the alerts API endpoints.
It uses Django REST Framework's router system to automatically generate
RESTful URL patterns for the Alert model.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertViewSet

# Initialize DRF router for RESTful routing
router = DefaultRouter()

# Register AlertViewSet with an empty prefix to create routes like:
# GET /api/alerts/ - List all alerts
# POST /api/alerts/ - Create a new alert
# GET /api/alerts/{id}/ - Retrieve a specific alert
# PUT /api/alerts/{id}/ - Update a specific alert
# DELETE /api/alerts/{id}/ - Delete a specific alert
router.register(r"", AlertViewSet, basename="alert")

# Include the router-generated URL patterns
urlpatterns = [
    path("", include(router.urls)),
]
