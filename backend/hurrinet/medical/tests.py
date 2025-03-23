from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import MedicalFacility, MedicalSupply, MedicalEmergency


class MedicalFacilityTests(TestCase):
    def setUp(self):
        self.facility = MedicalFacility.objects.create(
            name="Test Hospital",
            facility_type="HOSPITAL",
            address="123 Test St",
            total_capacity=100,
            current_occupancy=50,
            primary_contact="John Doe",
            phone_number="1234567890",
        )

    def test_available_capacity(self):
        self.assertEqual(self.facility.available_capacity(), 50)

    def test_occupancy_percentage(self):
        self.assertEqual(self.facility.occupancy_percentage(), 50.0)

    def test_str_representation(self):
        self.assertEqual(str(self.facility), "Test Hospital (Fully Operational)")


class MedicalSupplyTests(TestCase):
    def setUp(self):
        self.facility = MedicalFacility.objects.create(
            name="Test Hospital",
            facility_type="HOSPITAL",
            address="123 Test St",
            total_capacity=100,
            primary_contact="John Doe",
            phone_number="1234567890",
        )
        self.supply = MedicalSupply.objects.create(
            facility=self.facility,
            name="Test Supply",
            supply_type="MEDICATION",
            quantity=10,
            threshold_level=5,
        )

    def test_is_critical(self):
        self.supply.quantity = 5
        self.supply.save()
        self.assertTrue(self.supply.is_critical())

        self.supply.quantity = 6
        self.supply.save()
        self.assertFalse(self.supply.is_critical())


class MedicalEmergencyTests(TestCase):
    def setUp(self):
        self.facility = MedicalFacility.objects.create(
            name="Test Hospital",
            facility_type="HOSPITAL",
            address="123 Test St",
            total_capacity=100,
            primary_contact="John Doe",
            phone_number="1234567890",
        )
        self.emergency = MedicalEmergency.objects.create(
            incident_id="TEST-001",
            location_lat=0.0,
            location_lng=0.0,
            description="Test emergency",
            severity="HIGH",
            assigned_facility=self.facility,
        )

    def test_time_since_reported(self):
        self.assertIsNotNone(self.emergency.time_since_reported())


class MedicalAPITests(APITestCase):
    def setUp(self):
        self.facility = MedicalFacility.objects.create(
            name="Test Hospital",
            facility_type="HOSPITAL",
            address="123 Test St",
            total_capacity=100,
            current_occupancy=50,
            primary_contact="John Doe",
            phone_number="1234567890",
        )
        self.supply = MedicalSupply.objects.create(
            facility=self.facility,
            name="Test Supply",
            supply_type="MEDICATION",
            quantity=10,
            threshold_level=5,
        )
        self.emergency = MedicalEmergency.objects.create(
            incident_id="TEST-001",
            location_lat=0.0,
            location_lng=0.0,
            description="Test emergency",
            severity="HIGH",
            assigned_facility=self.facility,
        )

    def test_list_facilities(self):
        url = reverse("medical:medicalfacility-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_supplies(self):
        url = reverse("medical:medicalsupply-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_emergencies(self):
        url = reverse("medical:medicalemergency-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_emergency(self):
        url = reverse("medical:medicalemergency-list")
        data = {
            "location_lat": 1.0,
            "location_lng": 1.0,
            "description": "New emergency",
            "severity": "HIGH",
            "assigned_facility": self.facility.id,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            MedicalEmergency.objects.filter(description="New emergency").exists()
        )
