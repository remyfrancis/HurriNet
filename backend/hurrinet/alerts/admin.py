"""
Django admin configuration for the Alert model.
This module customizes how Alert objects are displayed and managed in the Django admin interface.
"""

from django.contrib import admin
from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for Alert model.

    Provides a customized interface for managing emergency alerts with features for:
    - Displaying key alert information in list view
    - Filtering alerts by various criteria
    - Searching through alerts
    - Protecting certain fields from modification
    """

    # Configure which fields appear in the alerts list view
    list_display = [
        "title",
        "severity",
        "district",
        "created_by",
        "is_active",
        "is_public",
        "created_at",
    ]

    # Add filter options in the right sidebar
    list_filter = ["severity", "district", "is_active", "is_public", "created_at"]

    # Enable search functionality for text-based fields
    search_fields = ["title", "description", "affected_areas"]

    # Prevent modification of timestamp fields
    readonly_fields = ["created_at", "updated_at"]

    # Use a search interface for selecting the alert creator
    raw_id_fields = ["created_by"]
