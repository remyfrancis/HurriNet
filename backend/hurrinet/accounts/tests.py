"""
Tests for the accounts app.

This module contains test cases for models, serializers, views,
and permissions in the accounts app.
"""

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import CustomGroup
from accounts.serializers import UserSerializer, RegisterSerializer

User = get_user_model()


class UserModelTests(TestCase):
    """Test cases for the custom User model."""

    def setUp(self):
        """Set up test data."""
        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "testpass123",
            "role": "CITIZEN",
            "address": "Test Location",
        }

    def test_create_user(self):
        """Test creating a regular user."""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data["email"])
        self.assertEqual(user.first_name, self.user_data["first_name"])
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        """Test creating a superuser."""
        admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="admin123",
            first_name="Admin",
            last_name="User",
            address="Admin Location",
        )
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_staff)
        self.assertEqual(admin_user.role, "ADMINISTRATOR")


class CustomGroupTests(TestCase):
    """Test cases for the CustomGroup model."""

    def setUp(self):
        """Set up test data."""
        self.group_data = {"name": "Test Group", "group_type": "CITIZEN"}

    def test_create_group(self):
        """Test creating a custom group."""
        group = CustomGroup.objects.create(**self.group_data)
        self.assertEqual(group.name, self.group_data["name"])
        self.assertEqual(group.group_type, self.group_data["group_type"])


class UserSerializerTests(TestCase):
    """Test cases for the UserSerializer."""

    def setUp(self):
        """Set up test data."""
        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "testpass123",
            "role": "CITIZEN",
            "address": "Test Location",
        }
        self.user = User.objects.create_user(**self.user_data)
        self.serializer = UserSerializer(instance=self.user)

    def test_contains_expected_fields(self):
        """Test that the serializer contains the expected fields."""
        data = self.serializer.data
        expected_fields = {
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "address",
            "first_responder_id",
            "medical_license_id",
            "is_active",
        }
        self.assertEqual(set(data.keys()), expected_fields)


class AuthViewTests(TestCase):
    """Test cases for authentication views."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "testpass123",
            "role": "CITIZEN",
            "address": "Test Location",
        }

    def test_user_registration(self):
        """Test user registration endpoint."""
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertIn("access", response.data)

    def test_user_login(self):
        """Test user login endpoint."""
        User.objects.create_user(**self.user_data)
        login_data = {
            "email": self.user_data["email"],
            "password": self.user_data["password"],
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class PermissionTests(TestCase):
    """Test cases for permission handling."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="admin123",
            first_name="Admin",
            last_name="User",
            address="Admin Location",
        )
        self.citizen_user = User.objects.create_user(
            email="citizen@example.com",
            password="citizen123",
            first_name="Citizen",
            last_name="User",
            role="CITIZEN",
            address="Citizen Location",
        )
        self.citizen_group = CustomGroup.objects.create(
            name="Citizens", group_type="CITIZEN"
        )

    def test_superuser_permissions(self):
        """Test that superusers have all permissions."""
        self.assertTrue(self.admin_user.is_superuser)
        self.assertTrue(self.admin_user.has_perm("accounts.add_user"))
        self.assertTrue(self.admin_user.has_perm("accounts.change_user"))

    def test_citizen_permissions(self):
        """Test permissions for citizen users."""
        # Add user to the citizen group
        self.citizen_user.groups.add(self.citizen_group)

        # Check that citizen users are not staff
        self.assertFalse(self.citizen_user.is_staff)

        # Check that citizen users belong to the correct group
        self.assertTrue(
            self.citizen_user.groups.filter(
                name="Citizens", group_type="CITIZEN"
            ).exists()
        )

    def test_api_permission_enforcement(self):
        """Test that API endpoints enforce permissions correctly."""
        admin_url = "/admin/"
        response = self.client.get(admin_url)
        self.assertEqual(
            response.status_code, status.HTTP_302_FOUND
        )  # Redirects to login

        self.client.force_authenticate(user=self.citizen_user)
        response = self.client.get(admin_url)
        self.assertEqual(
            response.status_code, status.HTTP_302_FOUND
        )  # Redirects to login
