# hurrinet_backend/hurrinet/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin interface for User model.
    Extends Django's UserAdmin to handle our custom User model with email authentication.
    """

    # Configure list view
    list_display = (
        "email",  # Primary identifier
        "first_name",
        "last_name",
        "role",  # User type
        "is_staff",  # Admin status
    )

    # Filtering options in admin list view
    list_filter = (
        "role",  # Filter by user type
        "is_staff",  # Filter by admin status
        "is_active",  # Filter by account status
    )

    # Default ordering in list view
    ordering = ("email",)

    # Fields available for searching
    search_fields = ("email", "first_name", "last_name")

    # Configuration for editing existing users
    fieldsets = (
        # Login credentials section
        (None, {"fields": ("email", "password")}),
        # Personal information section
        (
            "Personal info",
            {"fields": ("first_name", "last_name", "phone_number", "address")},
        ),
        # Professional information section
        (
            "Role and IDs",
            {"fields": ("role", "first_responder_id", "medical_license_id")},
        ),
        # User permissions section
        (
            "Permissions",
            {
                "fields": (
                    "is_active",  # Account status
                    "is_staff",  # Admin site access
                    "is_superuser",  # Full permissions
                    "groups",  # Group permissions
                    "user_permissions",  # Individual permissions
                )
            },
        ),
        # Timestamps section
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Configuration for adding new users
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),  # Use wide layout
                "fields": (
                    # Required fields
                    "email",
                    "password1",
                    "password2",  # Password confirmation
                    "role",
                    "first_name",
                    "last_name",
                    # Optional fields
                    "phone_number",
                    "address",
                    "first_responder_id",
                    "medical_license_id",
                ),
            },
        ),
    )
