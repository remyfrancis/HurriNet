# accounts/urls.py

"""
URL configuration for the accounts app.

This module defines the URL patterns for:
1. Authentication endpoints (register, login)
2. User management endpoints (CRUD operations)

The URLs are automatically generated using DRF's DefaultRouter
based on the ViewSet configurations.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import AuthViewSet, UserViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()

# Authentication endpoints: /api/auth/
# - POST /api/auth/register/ (user registration)
# - POST /api/auth/login/ (user login)
router.register(r"users", UserViewSet)
router.register(r"auth", AuthViewSet, basename="auth")

# URL patterns for the accounts app
urlpatterns = [
    # JWT Authentication endpoints
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Include all router-generated URLs
    path("", include(router.urls)),
]
