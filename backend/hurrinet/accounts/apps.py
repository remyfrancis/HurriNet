# accounts/apps.py

"""
Django app configuration for the accounts app.

This module defines the app configuration for the accounts app,
which handles user authentication, authorization, and management
in the HurriNet application.

The app provides:
1. Custom User model
2. Role-based permissions
3. Authentication endpoints
4. User management
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """
    Configuration class for the accounts app.

    This class defines:
    1. The database field type for auto-generated primary keys
    2. The app name for Django's app registry

    The app handles:
    - User authentication
    - Permission management
    - Group management
    - User profiles
    """

    # Use BigAutoField for primary keys (supports more entries than AutoField)
    default_auto_field = "django.db.models.BigAutoField"

    # App name in Django's app registry
    name = "accounts"
