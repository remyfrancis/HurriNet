"""
Tests for incident reporting in HurriNet.

This module contains tests for incidents, updates, flags, and related permissions.
"""

from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Incident, IncidentUpdate, IncidentFlag
from django.utils import timezone

User = get_user_model()


class IncidentTests(APITestCase):
    """Test cases for incident functionality."""

    def setUp(self):
        """Set up test data."""
        # Create test users
        self.citizen = User.objects.create_user(
            email="citizen@test.com",
            password="testpass123",
            first_name="Test",
            last_name="Citizen",
            role="CITIZEN",
        )
        self.emergency = User.objects.create_user(
            email="emergency@test.com",
            password="testpass123",
            first_name="Test",
            last_name="Emergency",
            role="EMERGENCY_PERSONNEL",
        )

        # Create test incident
        self.test_incident = Incident.objects.create(
            title="Test Flood",
            description="Test flood description",
            incident_type="FLOOD",
            severity="HIGH",
            status="REPORTED",
            location="Test Location",
            latitude=35.7796,
            longitude=-78.6382,
            reported_by=self.citizen,
        )

        # URLs
        self.incidents_url = reverse("incident-list")
        self.incident_detail_url = reverse(
            "incident-detail", args=[self.test_incident.id]
        )
        self.verify_url = reverse("incident-verify", args=[self.test_incident.id])
        self.assign_url = reverse("incident-assign", args=[self.test_incident.id])
        self.update_status_url = reverse(
            "incident-update-status", args=[self.test_incident.id]
        )
        self.add_update_url = reverse(
            "incident-add-update", args=[self.test_incident.id]
        )
        self.flag_url = reverse("incident-flag", args=[self.test_incident.id])

    def test_create_incident(self):
        """Test creating a new incident."""
        self.client.force_authenticate(user=self.citizen)
        data = {
            "title": "New Flood",
            "description": "New flood description",
            "incident_type": "FLOOD",
            "severity": "HIGH",
            "location": "New Location",
            "latitude": 35.7796,
            "longitude": -78.6382,
        }
        response = self.client.post(self.incidents_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Incident.objects.count(), 2)
        self.assertEqual(response.data["title"], "New Flood")
        self.assertEqual(response.data["reported_by"]["email"], "citizen@test.com")

    def test_list_incidents(self):
        """Test listing all incidents."""
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.incidents_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_incident_detail(self):
        """Test retrieving a specific incident."""
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.incident_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Flood")

    def test_update_incident(self):
        """Test updating an incident."""
        self.client.force_authenticate(user=self.citizen)
        data = {"description": "Updated flood description"}
        response = self.client.patch(self.incident_detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Updated flood description")

    def test_verify_incident(self):
        """Test verifying an incident."""
        # Test with citizen (should fail)
        self.client.force_authenticate(user=self.citizen)
        response = self.client.post(self.verify_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test with emergency personnel (should succeed)
        self.client.force_authenticate(user=self.emergency)
        response = self.client.post(self.verify_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "VERIFIED")
        self.assertEqual(response.data["verified_by"]["email"], "emergency@test.com")

    def test_assign_incident(self):
        """Test assigning an incident."""
        self.client.force_authenticate(user=self.emergency)
        data = {"assignee_id": self.emergency.id}
        response = self.client.post(self.assign_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["assigned_to"]["email"], "emergency@test.com")
        self.assertEqual(response.data["status"], "IN_PROGRESS")

    def test_update_incident_status(self):
        """Test updating incident status."""
        self.client.force_authenticate(user=self.citizen)
        data = {"status": "RESOLVED"}
        response = self.client.post(self.update_status_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "RESOLVED")
        self.assertIsNotNone(response.data["resolved_at"])


class IncidentUpdateTests(APITestCase):
    """Test cases for incident updates."""

    def setUp(self):
        """Set up test data."""
        self.citizen = User.objects.create_user(
            email="citizen@test.com", password="testpass123", role="CITIZEN"
        )
        self.test_incident = Incident.objects.create(
            title="Test Incident",
            description="Test description",
            incident_type="FLOOD",
            severity="HIGH",
            location="Test Location",
            latitude=35.7796,
            longitude=-78.6382,
            reported_by=self.citizen,
        )
        self.add_update_url = reverse(
            "incident-add-update", args=[self.test_incident.id]
        )

    def test_add_update(self):
        """Test adding an update to an incident."""
        self.client.force_authenticate(user=self.citizen)
        data = {"content": "Test update content"}
        response = self.client.post(self.add_update_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(IncidentUpdate.objects.count(), 1)
        self.assertEqual(response.data["content"], "Test update content")
        self.assertEqual(response.data["author"]["email"], "citizen@test.com")


class IncidentFlagTests(APITestCase):
    """Test cases for incident flags."""

    def setUp(self):
        """Set up test data."""
        self.citizen = User.objects.create_user(
            email="citizen@test.com", password="testpass123", role="CITIZEN"
        )
        self.emergency = User.objects.create_user(
            email="emergency@test.com",
            password="testpass123",
            role="EMERGENCY_PERSONNEL",
        )
        self.test_incident = Incident.objects.create(
            title="Test Incident",
            description="Test description",
            incident_type="FLOOD",
            severity="HIGH",
            location="Test Location",
            latitude=35.7796,
            longitude=-78.6382,
            reported_by=self.citizen,
        )
        self.flag_url = reverse("incident-flag", args=[self.test_incident.id])

    def test_flag_incident(self):
        """Test flagging an incident."""
        self.client.force_authenticate(user=self.citizen)
        data = {"reason": "INACCURATE", "description": "Information is incorrect"}
        response = self.client.post(self.flag_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(IncidentFlag.objects.count(), 1)
        self.assertEqual(response.data["reason"], "INACCURATE")
        self.assertEqual(response.data["reported_by"]["email"], "citizen@test.com")


class IncidentPermissionTests(APITestCase):
    """Test cases for incident permissions."""

    def setUp(self):
        """Set up test data."""
        self.citizen = User.objects.create_user(
            email="citizen@test.com", password="testpass123", role="CITIZEN"
        )
        self.other_citizen = User.objects.create_user(
            email="other@test.com", password="testpass123", role="CITIZEN"
        )
        self.emergency = User.objects.create_user(
            email="emergency@test.com",
            password="testpass123",
            role="EMERGENCY_PERSONNEL",
        )
        self.test_incident = Incident.objects.create(
            title="Test Incident",
            description="Test description",
            incident_type="FLOOD",
            severity="HIGH",
            location="Test Location",
            latitude=35.7796,
            longitude=-78.6382,
            reported_by=self.citizen,
        )
        self.incident_detail_url = reverse(
            "incident-detail", args=[self.test_incident.id]
        )

    def test_reporter_permissions(self):
        """Test that only the reporter can edit their incident."""
        # Test with incident reporter
        self.client.force_authenticate(user=self.citizen)
        data = {"description": "Updated by reporter"}
        response = self.client.patch(self.incident_detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test with different citizen
        self.client.force_authenticate(user=self.other_citizen)
        data = {"description": "Updated by other"}
        response = self.client.patch(self.incident_detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_emergency_personnel_permissions(self):
        """Test emergency personnel permissions."""
        self.client.force_authenticate(user=self.emergency)

        # Can view incident
        response = self.client.get(self.incident_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Can verify incident
        verify_url = reverse("incident-verify", args=[self.test_incident.id])
        response = self.client.post(verify_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Can assign incident
        assign_url = reverse("incident-assign", args=[self.test_incident.id])
        data = {"assignee_id": self.emergency.id}
        response = self.client.post(assign_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
