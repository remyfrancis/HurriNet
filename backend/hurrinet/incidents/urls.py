"""
URL configuration for the incidents app.

This module defines the URL patterns for incident-related endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet

# Create a router and register our viewset with it
router = DefaultRouter()
router.register(r"", IncidentViewSet, basename="incident")

# URL patterns for incident endpoints:
# - GET /api/incidents/ (list all incidents)
# - POST /api/incidents/ (create new incident)
# - GET /api/incidents/{id}/ (get specific incident)
# - PUT/PATCH /api/incidents/{id}/ (update incident)
# - DELETE /api/incidents/{id}/ (delete incident)
# - POST /api/incidents/{id}/update-status/ (update status)
# - POST /api/incidents/{id}/verify/ (verify incident)
# - POST /api/incidents/{id}/assign/ (assign incident)
# - POST /api/incidents/{id}/add-update/ (add update)
# - GET /api/incidents/{id}/updates/ (get updates)
# - POST /api/incidents/{id}/flag/ (flag incident)
# - GET /api/incidents/{id}/flags/ (get flags)
# - GET /api/incidents/my-incidents/ (get user's incidents)
# - GET /api/incidents/nearby/ (get nearby incidents)
urlpatterns = [
    path("", include(router.urls)),
]
