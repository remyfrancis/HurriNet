"""
URL configuration for the HurriNet project.

This module defines the root URL patterns for the entire project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from incidents.views import IncidentViewSet
from alerts.views import AlertViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import UserViewSet
from weather.views import WeatherViewSet
from feed.views import FeedPostViewSet
from django.http import HttpResponse


# Health check view
def health_check(request):
    return HttpResponse("OK", status=200)


# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"incidents", IncidentViewSet, basename="incident")
router.register(r"weather", WeatherViewSet, basename="weather")
router.register(r"feed/posts", FeedPostViewSet, basename="feed-post")
router.register(r"alerts", AlertViewSet, basename="alert")

urlpatterns = (
    [
        path("health/", health_check, name="health_check"),
        path("admin/", admin.site.urls),
        path("api/", include(router.urls)),
        path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
        path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
        path("api/auth/", include("accounts.urls")),
        path("api/chats/", include("chats.urls")),
        path("api/resource-management/", include("resource_management.urls")),
        path("api/weather/", include("weather.urls")),
        path("api/alerts/", include("alerts.urls")),
        path("api/incidents/", include("incidents.urls")),
        path("api/shelters/", include("shelters.urls")),
        path("api/social/", include("social.urls")),
    ]
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
