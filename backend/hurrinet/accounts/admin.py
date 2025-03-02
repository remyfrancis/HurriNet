# hurrinet_backend/hurrinet/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Permission
from .models import User, CustomGroup, PermissionCategory


@admin.register(PermissionCategory)
class PermissionCategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for PermissionCategory model.

    This admin interface allows management of permission categories that organize
    permissions into logical groups (e.g., Citizen permissions, Medical permissions).

    Features:
    - List display shows category name and description
    - Search functionality for finding categories
    - Ordered display by category name
    """

    list_display = ("name", "description")
    search_fields = ("name", "description")
    ordering = ("name",)


@admin.register(Permission)
class CustomPermissionAdmin(admin.ModelAdmin):
    """
    Admin configuration for Permission model with category information.

    This custom admin interface enhances the default Permission admin by:
    - Displaying permissions with their content types
    - Providing filtering by content type
    - Enabling search by permission name or codename
    - Organizing permissions in a logical order

    This makes it easier to manage and assign permissions across the system.
    """

    list_display = ("name", "codename", "content_type")
    list_filter = ("content_type",)
    search_fields = ("name", "codename")
    ordering = ("content_type__app_label", "content_type__model", "codename")


@admin.register(CustomGroup)
class CustomGroupAdmin(admin.ModelAdmin):
    """
    Admin configuration for CustomGroup model.

    This admin interface manages user groups and their permissions with features:
    - Display of group name and type
    - Filtering by group type
    - Search functionality for groups
    - Horizontal filter interface for permission assignment

    The get_form method customizes the permission selection by:
    1. Filtering permissions to show only relevant ones
    2. Ordering permissions by name for easier selection
    3. Limiting to permissions associated with the accounts app
    """

    list_display = ("name", "group_type")
    list_filter = ("group_type",)
    search_fields = ("name",)
    filter_horizontal = ("permissions",)

    def get_form(self, request, obj=None, **kwargs):
        """
        Customize the admin form for CustomGroup.

        This method enhances the permission selection interface by:
        - Filtering permissions to show only those from the accounts app
        - Ordering permissions by name for easier selection
        - Only showing permissions relevant to the CustomGroup model

        Args:
            request: The HTTP request
            obj: The CustomGroup being edited (None for new groups)
            **kwargs: Additional arguments

        Returns:
            ModelForm: The customized form for the admin interface
        """
        form = super().get_form(request, obj, **kwargs)
        if obj:
            # Group permissions by category
            permission_field = form.base_fields["permissions"]
            permission_field.queryset = Permission.objects.filter(
                content_type__app_label="accounts", content_type__model="customgroup"
            ).order_by("name")
        return form


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for custom User model.

    This admin interface extends Django's UserAdmin to handle our custom User model
    with email-based authentication and additional fields. Features include:
    - Display of user information including role and status
    - Filtering by role and status
    - Search across multiple user fields
    - Organized fieldsets for adding/editing users
    """

    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "is_staff",
    )
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone_number",
                    "address",
                )
            },
        ),
        (
            "Professional Info",
            {
                "fields": (
                    "first_responder_id",
                    "medical_license_id",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "role",
                    "phone_number",
                    "address",
                ),
            },
        ),
    )
