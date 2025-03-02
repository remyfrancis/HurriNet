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
from .views import AuthViewSet, UserViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()

# Authentication endpoints: /api/auth/
# - POST /api/auth/register/ (user registration)
# - POST /api/auth/login/ (user login)
router.register("auth", AuthViewSet, basename="auth")

# User management endpoints: /api/users/
# - GET /api/users/ (list users)
# - POST /api/users/ (create user)
# - GET /api/users/{id}/ (retrieve user)
# - PUT /api/users/{id}/ (update user)
# - DELETE /api/users/{id}/ (delete user)
router.register("users", UserViewSet, basename="users")

# URL patterns for the accounts app
urlpatterns = [
    # Include all router-generated URLs
    path("", include(router.urls)),
]
