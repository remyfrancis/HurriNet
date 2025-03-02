# accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType


class PermissionCategory(models.Model):
    """
    Model to categorize permissions into logical groups.

    This model helps organize permissions into meaningful categories such as:
    - Citizen permissions (for basic user actions)
    - Emergency Personnel permissions (for emergency response actions)
    - Resource Manager permissions (for resource allocation)
    - Medical Personnel permissions (for medical-related actions)
    - Administrator permissions (for system management)
    - Chat permissions (for communication features)

    Each category groups related permissions to make them easier to manage and assign.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the permission category (e.g., 'Citizen permissions')",
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of what this category of permissions encompasses",
    )

    class Meta:
        verbose_name = "permission category"
        verbose_name_plural = "permission categories"
        db_table = "permission_categories"

    def __str__(self):
        return self.name


class CustomGroup(Group):
    """
    Custom Group model that extends Django's default Group model.
    Provides predefined groups for different user roles in the system.

    Key Features:
    1. Predefined group types (Administrator, Citizen, Emergency Personnel, etc.)
    2. Organized permissions by category for each group
    3. Automatic permission assignment based on group type
    4. Integration with the custom permission category system

    Usage:
    - Groups are automatically created during migration
    - Users are automatically assigned to appropriate groups based on their role
    - Each group comes with predefined permissions based on their responsibilities
    """

    # Predefined choices for different types of groups in the system
    GROUP_CHOICES = [
        ("ADMINISTRATOR_GROUP", "Administrator Group"),  # Full system access
        ("CITIZEN_GROUP", "Citizen Group"),  # Basic user access
        ("EMERGENCY_GROUP", "Emergency Personnel Group"),  # Emergency response access
        (
            "RESOURCE_MANAGER_GROUP",
            "Resource Manager Group",
        ),  # Resource management access
        ("MEDICAL_PERSONNEL_GROUP", "Medical Personnel Group"),  # Medical system access
    ]

    # Define permissions for each group with their categories
    # This dictionary maps group types to their permissions, organized by category
    GROUP_PERMISSIONS = {
        "ADMINISTRATOR_GROUP": {
            "Administrator permissions": [
                (
                    "view_all_incidents",
                    "Can view all incidents",
                ),  # Full incident visibility
                ("manage_users", "Can manage user accounts"),  # User management
                ("manage_resources", "Can manage resources"),  # Resource management
                ("manage_alerts", "Can manage emergency alerts"),  # Alert management
                ("view_analytics", "Can view system analytics"),  # Analytics access
            ],
            "Chat permissions": [
                (
                    "manage_chat_rooms",
                    "Can manage chat rooms",
                ),  # Chat room administration
                (
                    "moderate_messages",
                    "Can moderate chat messages",
                ),  # Message moderation
            ],
        },
        "CITIZEN_GROUP": {
            "Citizen permissions": [
                ("report_incident", "Can report incidents"),  # Basic incident reporting
                ("view_public_alerts", "Can view public alerts"),  # Public alert access
                ("request_assistance", "Can request assistance"),  # Assistance requests
            ],
            "Chat permissions": [
                (
                    "join_public_chats",
                    "Can join public chat rooms",
                ),  # Public chat access
                ("send_messages", "Can send chat messages"),  # Basic messaging
            ],
        },
        "EMERGENCY_GROUP": {
            "Emergency Personnel permissions": [
                (
                    "respond_to_incidents",
                    "Can respond to incidents",
                ),  # Incident response
                (
                    "update_incident_status",
                    "Can update incident status",
                ),  # Status updates
                (
                    "view_emergency_alerts",
                    "Can view emergency alerts",
                ),  # Emergency alerts
                (
                    "create_situation_reports",
                    "Can create situation reports",
                ),  # Reporting
            ],
            "Chat permissions": [
                (
                    "join_emergency_chats",
                    "Can join emergency chat rooms",
                ),  # Emergency chats
                (
                    "send_priority_messages",
                    "Can send priority messages",
                ),  # Priority messaging
            ],
        },
        "RESOURCE_MANAGER_GROUP": {
            "Resource Manager permissions": [
                ("manage_resources", "Can manage resources"),  # Resource management
                (
                    "view_resource_requests",
                    "Can view resource requests",
                ),  # Request viewing
                ("allocate_resources", "Can allocate resources"),  # Resource allocation
                ("view_resource_analytics", "Can view resource analytics"),  # Analytics
            ],
            "Chat permissions": [
                (
                    "join_resource_chats",
                    "Can join resource management chat rooms",
                ),  # Resource chats
                (
                    "send_resource_updates",
                    "Can send resource update messages",
                ),  # Resource updates
            ],
        },
        "MEDICAL_PERSONNEL_GROUP": {
            "Medical Personnel permissions": [
                ("view_medical_cases", "Can view medical cases"),  # Medical case access
                (
                    "update_medical_status",
                    "Can update medical status",
                ),  # Status updates
                (
                    "create_medical_reports",
                    "Can create medical reports",
                ),  # Medical reporting
                (
                    "view_medical_analytics",
                    "Can view medical analytics",
                ),  # Medical analytics
            ],
            "Chat permissions": [
                ("join_medical_chats", "Can join medical chat rooms"),  # Medical chats
                (
                    "send_medical_updates",
                    "Can send medical update messages",
                ),  # Medical updates
            ],
        },
    }

    # Define permission categories with their descriptions
    PERMISSION_CATEGORIES = [
        ("Citizen permissions", "Permissions for regular citizens"),
        ("Emergency Personnel permissions", "Permissions for emergency responders"),
        ("Resource Manager permissions", "Permissions for resource managers"),
        ("Medical Personnel permissions", "Permissions for medical staff"),
        ("Administrator permissions", "Permissions for system administrators"),
        ("Chat permissions", "Permissions for chat system"),
    ]

    group_type = models.CharField(
        max_length=50,
        choices=GROUP_CHOICES,
        unique=True,
        default="CITIZEN_GROUP",
        help_text="Type of the group determining its role in the system",
    )

    class Meta:
        db_table = "custom_groups"
        verbose_name = "group"
        verbose_name_plural = "groups"

    def __str__(self):
        return f"{self.name} ({dict(self.GROUP_CHOICES).get(self.group_type, '')})"

    @classmethod
    def get_group_for_role(cls, role):
        """
        Get the corresponding group for a user role.

        This method maps user roles to their corresponding groups, ensuring
        users are assigned to the correct group based on their role.

        Args:
            role: User role from User.ROLE_CHOICES

        Returns:
            CustomGroup object corresponding to the role, or None if no match
        """
        role_to_group = {
            "ADMINISTRATOR": "ADMINISTRATOR_GROUP",
            "CITIZEN": "CITIZEN_GROUP",
            "EMERGENCY_PERSONNEL": "EMERGENCY_GROUP",
            "RESOURCE_MANAGER": "RESOURCE_MANAGER_GROUP",
            "MEDICAL_PERSONNEL": "MEDICAL_PERSONNEL_GROUP",
        }
        group_type = role_to_group.get(role)
        return cls.objects.get(group_type=group_type) if group_type else None


@receiver(post_migrate)
def create_default_groups_and_permissions(sender, **kwargs):
    """
    Create default groups, permission categories, and permissions after migration.

    This signal handler is triggered after migrations are applied and ensures that:
    1. All permission categories are created
    2. All necessary permissions are created with proper content types
    3. All default groups are created with their predefined permissions

    The process follows these steps:
    1. Create permission categories defined in PERMISSION_CATEGORIES
    2. Create a content type for custom permissions
    3. Create all permissions defined in GROUP_PERMISSIONS
    4. Create groups and assign their respective permissions

    This ensures the permission system is properly initialized and maintained.
    """
    if sender.name == "accounts":
        # Create permission categories
        categories = {}
        for category_name, description in CustomGroup.PERMISSION_CATEGORIES:
            category, _ = PermissionCategory.objects.get_or_create(
                name=category_name,
                defaults={"description": description},
            )
            categories[category_name] = category

        # Create a custom content type for our permissions
        content_type, _ = ContentType.objects.get_or_create(
            app_label="accounts",
            model="customgroup",
        )

        # Create all permissions first
        all_permissions = {}
        for group_perms in CustomGroup.GROUP_PERMISSIONS.values():
            for category_name, permissions in group_perms.items():
                for codename, name in permissions:
                    permission, created = Permission.objects.get_or_create(
                        codename=codename,
                        name=name,
                        content_type=content_type,
                    )
                    all_permissions[codename] = permission

        # Create groups and assign permissions
        for group_type, group_name in CustomGroup.GROUP_CHOICES:
            group, created = CustomGroup.objects.get_or_create(
                name=group_name,
                group_type=group_type,
            )

            # Collect all permissions for this group
            permissions_to_add = []
            group_permission_dict = CustomGroup.GROUP_PERMISSIONS.get(group_type, {})
            for category_perms in group_permission_dict.values():
                for codename, _ in category_perms:
                    permissions_to_add.append(all_permissions[codename])

            # Assign permissions to the group
            group.permissions.set(permissions_to_add)


class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    for authentication instead of usernames.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a user with the given email and password.

        Args:
            email: User's email address (required)
            password: User's password (optional)
            **extra_fields: Additional fields for the user model

        Returns:
            User object

        Raises:
            ValueError: If email is not provided
        """
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.

        Args:
            email: SuperUser's email address
            password: SuperUser's password
            **extra_fields: Additional fields for the user model

        Returns:
            User object with superuser permissions

        Raises:
            ValueError: If is_staff or is_superuser is not True
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMINISTRATOR")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model for HurriNet application.
    Extends Django's AbstractUser to use email instead of username
    and adds additional fields for emergency management system.
    """

    # Role choices for different types of users in the system
    ROLE_CHOICES = (
        ("ADMINISTRATOR", "Administrator"),  # System administrators
        ("CITIZEN", "Citizen"),  # Regular citizens/residents
        ("EMERGENCY_PERSONNEL", "Emergency Personnel"),  # First responders
        ("RESOURCE_MANAGER", "Resource Manager"),  # Manages emergency resources
        ("MEDICAL_PERSONNEL", "Medical Personnel"),  # Medical staff
    )

    # Basic user information
    username = None  # Remove username field as we use email
    email = models.CharField(max_length=255, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CITIZEN")
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)

    # Contact and location information
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)

    # Professional identification
    first_responder_id = models.CharField(max_length=50, blank=True, null=True)
    medical_license_id = models.CharField(max_length=50, blank=True, null=True)

    # Account status and permissions
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Use custom manager for user operations
    objects = CustomUserManager()

    # Django auth system configuration - Using CustomGroup instead of default Group
    groups = models.ManyToManyField(
        CustomGroup,
        related_name="accounts_user_set",  # Custom related_name to avoid conflicts
        blank=True,
        verbose_name="groups",
        help_text="The groups this user belongs to.",
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="accounts_user_set",  # Custom related_name to avoid conflicts
        blank=True,
        verbose_name="user permissions",
        help_text="Specific permissions for this user.",
    )

    # Configure email as the main identifier
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # Required during user creation

    class Meta:
        db_table = "users"  # Custom database table name

    def __str__(self):
        """String representation of the user"""
        return f"{self.first_name} {self.last_name} ({self.email})"

    def is_emergency_personnel(self):
        """Check if the user is emergency personnel"""
        return self.role == "EMERGENCY_PERSONNEL"

    def save(self, *args, **kwargs):
        """Override save method to automatically assign user to appropriate group"""
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:  # Only for newly created users
            matching_group = CustomGroup.get_group_for_role(self.role)
            if matching_group and matching_group not in self.groups.all():
                self.groups.add(matching_group)
