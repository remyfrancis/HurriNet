"""
URL configuration for the HurriNet project.

This module defines the root URL patterns for the entire project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from incidents.views import IncidentViewSet
from accounts.views import UserViewSet
from weather.views import WeatherViewSet
from alerts.views import AlertViewSet
from medical.views import (
    MedicalFacilityViewSet,
    MedicalSupplyViewSet,
    MedicalEmergencyViewSet,
    FacilityStatusReportViewSet,
)
from teams.views import TeamViewSet, TeamMemberViewSet
from social.views import PostViewSet, CommentViewSet
from chats.views import ChatSessionViewSet, ChatMessageViewSet
from resource_management.views import (
    ResourceViewSet,
    InventoryItemViewSet,
    ResourceRequestViewSet,
    SupplierViewSet,
    DistributionViewSet,
)
from shelters.views import ShelterViewSet
from contacts.views import ContactViewSet


# Health check view
def health_check(request):
    return HttpResponse("OK", status=200)


# Create a router and register our viewsets with it
router = DefaultRouter()

# User Management
router.register(r"users", UserViewSet, basename="user")

# Core Features
router.register(r"incidents", IncidentViewSet, basename="incident")
router.register(r"weather", WeatherViewSet, basename="weather")
router.register(r"alerts", AlertViewSet, basename="alert")

# Medical
router.register(
    r"medical/facilities", MedicalFacilityViewSet, basename="medical-facility"
)
router.register(r"medical/supplies", MedicalSupplyViewSet, basename="medical-supply")
router.register(
    r"medical/emergencies", MedicalEmergencyViewSet, basename="medical-emergency"
)
router.register(
    r"medical/status-reports",
    FacilityStatusReportViewSet,
    basename="facility-status-report",
)

# Contacts
router.register(r"contacts", ContactViewSet, basename="contact")

# Teams
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"team-members", TeamMemberViewSet, basename="team-member")

# Social
router.register(r"social/posts", PostViewSet, basename="post")
router.register(r"comments", CommentViewSet, basename="comment")

# Chats
router.register(r"chats/sessions", ChatSessionViewSet, basename="chat-session")
router.register(r"chats/messages", ChatMessageViewSet, basename="chat-message")

# Resource Management
# Commenting out registrations handled by include('resource_management.urls')
# router.register(r"resource-management/resources", ResourceViewSet, basename="resource")
# router.register(
#     r"inventory", InventoryItemViewSet, basename="inventory"
# )  # Remove: Should be handled by resource_management.urls
router.register(
    r"resource-requests",
    ResourceRequestViewSet,
    basename="resource-request",  # Keep - appears registered at /api/resource-requests
)
# router.register(r"resource-management/suppliers", SupplierViewSet, basename="supplier")
# router.register(
#     r"resource-management/distributions", DistributionViewSet, basename="distribution"
# )

# Shelters
router.register(r"shelters", ShelterViewSet, basename="shelter")

urlpatterns = (
    [
        path("health/", health_check, name="health_check"),
        path("admin/", admin.site.urls),
        path(
            "api/",
            include(
                [
                    path(
                        "", include(router.urls)
                    ),  # This will provide the API root view
                    path(
                        "token/",
                        TokenObtainPairView.as_view(),
                        name="token_obtain_pair",
                    ),
                    path(
                        "token/refresh/",
                        TokenRefreshView.as_view(),
                        name="token_refresh",
                    ),
                    path(
                        "accounts/", include("accounts.urls")
                    ),  # Account-related endpoints
                    path("incidents/", include("incidents.urls")),
                    path("weather/", include("weather.urls")),
                    path("alerts/", include("alerts.urls")),
                    path("chats/", include("chats.urls")),
                    path("resource-management/", include("resource_management.urls")),
                    path("resource_management/inventory/", include("resource_management.urls")),
                    path("shelters/", include("shelters.urls")),
                    path("social/", include("social.urls")),
                    path("medical/", include("medical.urls")),
                    path("teams/", include("teams.urls")),
                    path("contacts/", include("contacts.urls")),
                ]
            ),
        ),
    ]
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
