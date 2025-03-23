# accounts/urls.py

"""
URL configuration for the accounts app.

This module defines the URL patterns for:
1. Authentication endpoints (register, login)
2. User management endpoints (CRUD operations)
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import AuthViewSet

# URL patterns for the accounts app
urlpatterns = [
    # JWT Authentication endpoints
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Register endpoints
    path("register/", AuthViewSet.as_view({"post": "register"}), name="register"),
    path("register/emergency/", AuthViewSet.as_view({"post": "register_emergency"}), name="register_emergency"),
]
