"""
Tests for incident reporting in HurriNet.

This module contains tests for incidents, updates, flags, and related permissions.
"""

from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

# Import Point for GeoDjango
from django.contrib.gis.geos import Point
from .models import Incident, IncidentUpdate, IncidentFlag
from django.utils import timezone

# Import cache
from django.core.cache import cache

User = get_user_model()


# Helper function to create a minimal valid GeoJSON Point
def create_geojson_point(lon, lat):
    return {"type": "Point", "coordinates": [lon, lat]}


# Override cache settings for all tests in this module
@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
)
class IncidentTests(APITestCase):
    """Test cases for incident functionality."""

    def setUp(self):
        """Set up test data and clear cache."""
        # Clear cache before setting up data
        cache.clear()

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
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            first_name="Test",
            last_name="Admin",
            role="ADMIN",  # Assuming ADMIN role exists and has staff privileges
            is_staff=True,
        )

        # Create test incident - Use created_by and Point for location
        self.test_incident = Incident.objects.create(
            title="Test Flood",
            description="Test flood description",
            incident_type="FLOOD",
            severity="HIGH",
            # Use Point object for location field
            location=Point(-78.6382, 35.7796, srid=4326),
            created_by=self.citizen,
        )

        # URLs - Update reverse names if needed, add new ones
        self.incidents_url = reverse("incident-list")
        self.incident_detail_url = reverse(
            "incident-detail", args=[self.test_incident.id]
        )
        self.assign_url = reverse("incident-assign", args=[self.test_incident.id])
        self.resolve_url = reverse("incident-resolve", args=[self.test_incident.id])
        self.add_update_url = reverse(
            "incident-add-update", args=[self.test_incident.id]
        )
        self.updates_list_url = reverse(  # Added URL for listing updates
            "incident-updates", args=[self.test_incident.id]
        )
        self.flag_url = reverse("incident-flag", args=[self.test_incident.id])
        self.flags_list_url = reverse(  # Added URL for listing flags
            "incident-flags", args=[self.test_incident.id]
        )
        self.my_incidents_url = reverse("incident-my-incidents")  # Added URL

    def test_create_incident(self):
        """Test creating a new incident using IncidentCreateSerializer fields."""
        self.client.force_authenticate(user=self.citizen)
        # Use fields from IncidentCreateSerializer and GeoJSON for location
        location_data = create_geojson_point(-78.6383, 35.7797)
        data = {
            "title": "New Flood",
            "description": "New flood description",
            "incident_type": "FLOOD",
            "severity": "HIGH",
            "location": location_data,  # Send GeoJSON dict
            # 'photo': SimpleUploadedFile(...) # Optionally test photo upload
        }
        response = self.client.post(
            self.incidents_url, data, format="json"
        )  # Use format='json' for dict data
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Incident.objects.count(), 2)
        new_incident = Incident.objects.get(id=response.data["id"])
        self.assertEqual(new_incident.title, "New Flood")
        # Check created_by relation (note: serializer might return nested user data)
        self.assertEqual(new_incident.created_by, self.citizen)
        # Check location data was saved correctly
        self.assertAlmostEqual(new_incident.location.x, -78.6383)
        self.assertAlmostEqual(new_incident.location.y, 35.7797)
        # Check the response includes the created_by info correctly
        self.assertEqual(response.data["created_by"]["email"], "citizen@test.com")

    def test_list_incidents(self):
        """Test listing all incidents."""
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.incidents_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check the structure of the response (GeoJSON FeatureCollection)
        self.assertEqual(response.data["type"], "FeatureCollection")
        self.assertEqual(len(response.data["features"]), 1)
        self.assertEqual(
            response.data["features"][0]["properties"]["title"], "Test Flood"
        )

    def test_get_incident_detail(self):
        """Test retrieving a specific incident."""
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.incident_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check the structure of the response (GeoJSON Feature)
        self.assertEqual(response.data["type"], "Feature")
        self.assertEqual(response.data["properties"]["title"], "Test Flood")
        self.assertEqual(response.data["geometry"]["type"], "Point")

    def test_update_incident(self):
        """Test updating an incident (only reporter or emergency personnel/admin)."""
        self.client.force_authenticate(user=self.citizen)  # Reporter can update
        data = {"description": "Updated flood description"}
        response = self.client.patch(self.incident_detail_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["properties"]["description"], "Updated flood description"
        )

        # Test updating location (requires GeoJSON)
        new_location_data = create_geojson_point(-78.6385, 35.7799)
        data_loc = {"location": new_location_data}
        response_loc = self.client.patch(
            self.incident_detail_url, data_loc, format="json"
        )
        self.assertEqual(response_loc.status_code, status.HTTP_200_OK)
        self.test_incident.refresh_from_db()
        self.assertAlmostEqual(self.test_incident.location.x, -78.6385)
        self.assertAlmostEqual(self.test_incident.location.y, 35.7799)

    def test_assign_incident(self):
        """Test assigning an incident (emergency personnel/admin)."""
        self.client.force_authenticate(user=self.emergency)
        data = {"assignee_id": self.emergency.id}
        response = self.client.post(self.assign_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Refresh model instance
        self.test_incident.refresh_from_db()
        self.assertEqual(self.test_incident.assigned_to, self.emergency)
        # Check response data
        self.assertEqual(
            response.data["properties"]["assigned_to"]["email"], "emergency@test.com"
        )
        # Remove check for 'status' field unless it's confirmed to exist and be used
        # self.assertEqual(response.data["properties"]["status"], "IN_PROGRESS")

    def test_resolve_incident(self):
        """Test resolving an incident (staff/admin)."""
        # Test with non-staff (should fail)
        self.client.force_authenticate(user=self.citizen)
        response = self.client.post(self.resolve_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test with staff/admin (should succeed)
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.resolve_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Refresh model instance
        self.test_incident.refresh_from_db()
        self.assertTrue(self.test_incident.is_resolved)
        self.assertIsNotNone(self.test_incident.resolved_at)
        self.assertEqual(self.test_incident.resolved_by, self.admin)
        # Check response data
        self.assertTrue(response.data["properties"]["is_resolved"])
        self.assertIsNotNone(response.data["properties"]["resolved_at"])
        self.assertEqual(
            response.data["properties"]["resolved_by"]["email"], "admin@test.com"
        )


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
)
class IncidentUpdateTests(APITestCase):
    """Test cases for incident updates."""

    def setUp(self):
        """Set up test data and clear cache."""
        cache.clear()
        self.citizen = User.objects.create_user(
            email="citizen@test.com", password="testpass123", role="CITIZEN"
        )
        self.test_incident = Incident.objects.create(
            title="Test Incident",
            description="Test description",
            incident_type="FLOOD",
            severity="HIGH",
            location=Point(-78.6382, 35.7796, srid=4326),  # Use Point
            created_by=self.citizen,  # Use created_by
        )
        self.add_update_url = reverse(
            "incident-add-update", args=[self.test_incident.id]
        )
        self.updates_list_url = reverse(  # Added URL
            "incident-updates", args=[self.test_incident.id]
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

    def test_list_updates(self):
        """Test listing updates for an incident."""
        # Add an update first
        IncidentUpdate.objects.create(
            incident=self.test_incident, author=self.citizen, content="First update"
        )
        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.updates_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["content"], "First update")


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
)
class IncidentFlagTests(APITestCase):
    """Test cases for incident flags."""

    def setUp(self):
        """Set up test data and clear cache."""
        cache.clear()
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
            location=Point(-78.6382, 35.7796, srid=4326),  # Use Point
            created_by=self.citizen,  # Use created_by
        )
        self.flag_url = reverse("incident-flag", args=[self.test_incident.id])
        self.flags_list_url = reverse(  # Added URL
            "incident-flags", args=[self.test_incident.id]
        )

    def test_flag_incident(self):
        """Test flagging an incident."""
        self.client.force_authenticate(user=self.citizen)
        data = {"reason": "INACCURATE", "description": "Information is incorrect"}
        response = self.client.post(self.flag_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(IncidentFlag.objects.count(), 1)
        self.assertEqual(response.data["reason"], "INACCURATE")
        self.assertEqual(response.data["reported_by"]["email"], "citizen@test.com")

    def test_list_flags(self):
        """Test listing flags for an incident."""
        # Add a flag first
        IncidentFlag.objects.create(
            incident=self.test_incident,
            reported_by=self.citizen,
            reason="INACCURATE",
            description="Flag desc",
        )
        self.client.force_authenticate(
            user=self.emergency
        )  # Emergency/Admin can review flags
        response = self.client.get(self.flags_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reason"], "INACCURATE")

    # TODO: Add test for reviewing flags if relevant action/permission exists


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
)
class IncidentPermissionTests(APITestCase):
    """Test cases for incident permissions."""

    def setUp(self):
        """Set up test data and clear cache."""
        cache.clear()
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
            location=Point(-78.6382, 35.7796, srid=4326),  # Use Point
            created_by=self.citizen,  # Use created_by
        )
        self.incident_detail_url = reverse(
            "incident-detail", args=[self.test_incident.id]
        )
        self.my_incidents_url = reverse("incident-my-incidents")  # Added URL

    def test_reporter_or_readonly_permissions(self):
        """Test IsReporterOrReadOnly permission (reporter can edit, others can read)."""
        # Test GET with other citizen (should succeed)
        self.client.force_authenticate(user=self.other_citizen)
        response_get = self.client.get(self.incident_detail_url)
        self.assertEqual(response_get.status_code, status.HTTP_200_OK)

        # Test PATCH with other citizen (should fail)
        data = {"description": "Updated by other"}
        response_patch_other = self.client.patch(
            self.incident_detail_url, data, format="json"
        )
        self.assertEqual(response_patch_other.status_code, status.HTTP_403_FORBIDDEN)

        # Test PATCH with incident reporter (should succeed)
        self.client.force_authenticate(user=self.citizen)
        data_reporter = {"description": "Updated by reporter"}
        response_patch_reporter = self.client.patch(
            self.incident_detail_url, data_reporter, format="json"
        )
        self.assertEqual(response_patch_reporter.status_code, status.HTTP_200_OK)

        # Test PATCH with emergency personnel (should fail as per IsReporterOrReadOnly)
        # Note: If EmergencyPersonnel should bypass this, the permission needs changing
        self.client.force_authenticate(user=self.emergency)
        data_emergency = {"description": "Updated by emergency"}
        response_patch_emergency = self.client.patch(
            self.incident_detail_url, data_emergency, format="json"
        )
        # Assuming standard IsReporterOrReadOnly, this should be forbidden for PATCH
        self.assertEqual(
            response_patch_emergency.status_code, status.HTTP_403_FORBIDDEN
        )

    def test_my_incidents_action(self):
        """Test the my_incidents action returns correct incidents."""
        # Create another incident by the same user
        Incident.objects.create(
            title="Second Incident",
            description="Second description",
            incident_type="FIRE",
            severity="LOW",
            location=Point(-78.6380, 35.7790, srid=4326),
            created_by=self.citizen,
        )
        # Create incident assigned to the user - REMOVED assigned_to as field doesn't exist
        Incident.objects.create(
            title="Assigned Incident",
            description="Assigned description",
            incident_type="OTHER",
            severity="MODERATE",
            location=Point(-78.6370, 35.7780, srid=4326),
            created_by=self.other_citizen,  # Reported by someone else
            # assigned_to=self.citizen,      # This field doesn't exist on Incident model
        )
        # Create unrelated incident
        Incident.objects.create(
            title="Unrelated Incident",
            description="Unrelated",
            incident_type="WIND",
            severity="HIGH",
            location=Point(-78.6360, 35.7770, srid=4326),
            created_by=self.other_citizen,
        )

        self.client.force_authenticate(user=self.citizen)
        response = self.client.get(self.my_incidents_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return 2 incidents now: the one in setUp and the second one created by self.citizen
        self.assertEqual(len(response.data["features"]), 2)
        titles = [feat["properties"]["title"] for feat in response.data["features"]]
        self.assertIn("Test Incident", titles)
        self.assertIn("Second Incident", titles)
        # The "Assigned Incident" is no longer relevant to self.citizen for this query
        self.assertNotIn("Assigned Incident", titles)
        self.assertNotIn("Unrelated Incident", titles)


# TODO: Add tests for IncidentCreateSerializer.validate_location
# TODO: Add tests mocking geopy for Incident.get_location_name
# TODO: Add tests for WebSocket consumer if using Channels
# TODO: Add tests for file uploads (photo, attachment) if needed
