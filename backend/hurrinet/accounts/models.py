# accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


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

    # Django auth system configuration
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="accounts_user_set",  # Custom related_name to avoid conflicts
        blank=True,
        verbose_name="groups",
        help_text="The groups this user belongs to.",
    )

    user_permissions = models.ManyToManyField(
        "auth.Permission",
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
