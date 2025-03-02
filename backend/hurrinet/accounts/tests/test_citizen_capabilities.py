"""
Tests for citizen-specific capabilities in HurriNet.

This module tests the following citizen capabilities:
1. Weather information access
2. Feed posting and viewing
3. Alert viewing
4. Incident flagging
5. Map access
6. Shelter information access
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from incidents.models import Incident, IncidentFlag
from alerts.models import Alert
from resource_management.models import Shelter
from datetime import datetime

User = get_user_model()


class CitizenCapabilitiesTest(TestCase):
    """Test suite for citizen-specific capabilities."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()

        # Create a citizen user
        self.citizen = User.objects.create_user(
            email="citizen@example.com",
            password="testpass123",
            first_name="Test",
            last_name="Citizen",
            role="CITIZEN",
            address="123 Test St",
        )

        # Create test incident
        self.incident = Incident.objects.create(
            title="Test Incident",
            description="Test incident description",
            location="Test Location",
            severity="HIGH",
            status="ACTIVE",
            reported_by=self.citizen,
            incident_type="FLOOD",
        )

        # Create test alert
        self.alert = Alert.objects.create(
            title="Test Alert",
            description="Test alert description",
            severity="HIGH",
            area_affected="Test Area",
            alert_type="WEATHER",
            status="ACTIVE",
        )

        # Create test shelter
        self.shelter = Shelter.objects.create(
            name="Test Shelter",
            address="456 Shelter St",
            capacity=100,
            current_occupancy=50,
            status="OPEN",
        )

        # Authenticate the citizen
        self.client.force_authenticate(user=self.citizen)

    def test_weather_access(self):
        """Test that citizens can access weather information."""
        response = self.client.get("/api/weather/current/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("temperature", response.data)
        self.assertIn("conditions", response.data)

        # Test forecast access
        response = self.client.get("/api/weather/forecast/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_feed_operations(self):
        """Test that citizens can post to and view the feed."""
        # Test creating a feed post
        post_data = {"content": "Test feed post", "post_type": "UPDATE"}
        response = self.client.post("/api/feed/posts/", post_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test viewing feed
        response = self.client.get("/api/feed/posts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_alert_viewing(self):
        """Test that citizens can view alerts."""
        # Test viewing all alerts
        response = self.client.get("/api/alerts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

        # Test viewing specific alert
        response = self.client.get(f"/api/alerts/{self.alert.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Alert")

    def test_incident_flagging(self):
        """Test that citizens can flag incidents."""
        # Test flagging an incident
        flag_data = {
            "incident": self.incident.id,
            "reason": "INACCURATE",
            "description": "Test flag description",
        }
        response = self.client.post("/api/incidents/flags/", flag_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify flag was created
        self.assertTrue(
            IncidentFlag.objects.filter(
                incident=self.incident, reported_by=self.citizen
            ).exists()
        )

    def test_map_access(self):
        """Test that citizens can access map data."""
        # Test accessing map data
        response = self.client.get("/api/maps/data/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify map contains incidents and shelters
        self.assertIn("incidents", response.data)
        self.assertIn("shelters", response.data)

        # Test accessing specific area
        response = self.client.get("/api/maps/area/", {"lat": 25.7617, "lng": -80.1918})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_shelter_information(self):
        """Test that citizens can access shelter information."""
        # Test viewing all shelters
        response = self.client.get("/api/resource-management/shelters/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

        # Test viewing specific shelter
        response = self.client.get(
            f"/api/resource-management/shelters/{self.shelter.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Shelter")

        # Test shelter capacity information
        self.assertIn("capacity", response.data)
        self.assertIn("current_occupancy", response.data)
        self.assertIn("status", response.data)
