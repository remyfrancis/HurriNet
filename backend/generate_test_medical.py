import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone
import sys
import traceback

# Setup Django environment
try:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
    django.setup()
except Exception as e:
    print("Error setting up Django environment:")
    print(traceback.format_exc())
    sys.exit(1)

try:
    from django.contrib.auth import get_user_model
    from medical.models import (
        MedicalFacility,
        MedicalSupply,
        MedicalEmergency,
        FacilityStatusReport,
    )
except Exception as e:
    print("Error importing models:")
    print(traceback.format_exc())
    sys.exit(1)

User = get_user_model()

# Saint Lucia Medical Facilities Data
SAINT_LUCIA_FACILITIES = [
    {
        "name": "Owen King EU Hospital",
        "type": "HOSPITAL",
        "address": "Millennium Highway, Castries, Saint Lucia",
        "capacity": 120,
    },
    {
        "name": "Victoria Hospital",
        "type": "HOSPITAL",
        "address": "Chisel Street, Castries, Saint Lucia",
        "capacity": 80,
    },
    {
        "name": "St. Jude Hospital",
        "type": "HOSPITAL",
        "address": "Vieux Fort, Saint Lucia",
        "capacity": 90,
    },
    {
        "name": "Dennery Hospital",
        "type": "HOSPITAL",
        "address": "Dennery Village, Saint Lucia",
        "capacity": 40,
    },
    {
        "name": "Gros Islet Polyclinic",
        "type": "CLINIC",
        "address": "Gros Islet, Saint Lucia",
        "capacity": 30,
    },
    {
        "name": "Soufriere Hospital",
        "type": "HOSPITAL",
        "address": "Bridge Street, Soufriere, Saint Lucia",
        "capacity": 35,
    },
    {
        "name": "Tapion Hospital",
        "type": "HOSPITAL",
        "address": "Tapion, Castries, Saint Lucia",
        "capacity": 60,
    },
    {
        "name": "Castries Health Centre",
        "type": "CLINIC",
        "address": "Leslie Land Road, Castries, Saint Lucia",
        "capacity": 25,
    },
]

# Medical Supplies Data
MEDICAL_SUPPLIES = [
    ("Oxygen Tanks", "EQUIPMENT", 50),
    ("Ventilators", "EQUIPMENT", 10),
    ("N95 Masks", "PPE", 1000),
    ("Surgical Masks", "PPE", 5000),
    ("Medical Gloves", "PPE", 10000),
    ("Face Shields", "PPE", 500),
    ("Antibiotics", "MEDICATION", 1000),
    ("Pain Relievers", "MEDICATION", 2000),
    ("First Aid Kits", "FIRST_AID", 200),
    ("Bandages", "FIRST_AID", 5000),
    ("Blood Type A+", "BLOOD", 50),
    ("Blood Type O-", "BLOOD", 50),
    ("IV Fluids", "MEDICATION", 500),
    ("Defibrillators", "EQUIPMENT", 5),
    ("Surgical Instruments", "EQUIPMENT", 100),
]


def generate_medical_facilities():
    """Generate medical facilities in Saint Lucia"""
    print("Generating medical facilities...")
    facilities = []

    for facility_data in SAINT_LUCIA_FACILITIES:
        status = random.choice(["OPERATIONAL", "LIMITED", "CRITICAL", "OFFLINE"])
        occupancy = random.randint(0, facility_data["capacity"])

        facility = MedicalFacility.objects.create(
            name=facility_data["name"],
            facility_type=facility_data["type"],
            address=facility_data["address"],
            status=status,
            total_capacity=facility_data["capacity"],
            current_occupancy=occupancy,
            has_power=random.choice(
                [True, True, True, False]
            ),  # 75% chance of having power
            has_water=random.choice([True, True, True, False]),
            has_oxygen=random.choice([True, True, False]),
            has_ventilators=random.choice([True, True, False]),
            primary_contact=f"Dr. {random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])}",
            phone_number=f"758-{random.randint(100,999)}-{random.randint(1000,9999)}",
            email=f"info@{facility_data['name'].lower().replace(' ', '')}.lc",
        )
        facilities.append(facility)
        print(f"Created facility: {facility.name}")

    return facilities


def generate_medical_supplies(facilities):
    """Generate medical supplies for each facility"""
    print("\nGenerating medical supplies...")
    supplies = []

    for facility in facilities:
        for supply_name, supply_type, max_quantity in MEDICAL_SUPPLIES:
            quantity = random.randint(max_quantity // 10, max_quantity)
            threshold = max_quantity // 5

            supply = MedicalSupply.objects.create(
                facility=facility,
                name=supply_name,
                supply_type=supply_type,
                quantity=quantity,
                threshold_level=threshold,
                expiration_date=timezone.now().date()
                + timedelta(days=random.randint(30, 365)),
            )
            supplies.append(supply)
        print(f"Created supplies for: {facility.name}")

    return supplies


def generate_medical_emergencies(facilities):
    """Generate medical emergencies"""
    print("\nGenerating medical emergencies...")
    emergencies = []

    # Saint Lucia coordinates bounds
    LAT_MIN, LAT_MAX = 13.7, 14.1
    LNG_MIN, LNG_MAX = -61.1, -60.8

    status_choices = ["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    severity_choices = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    emergency_descriptions = [
        "Patient with severe respiratory distress",
        "Multiple trauma injuries from vehicle accident",
        "Suspected heart attack case",
        "Severe allergic reaction",
        "Workplace injury requiring immediate attention",
        "Childbirth complications",
        "Severe dehydration case",
        "Mental health crisis",
        "Drowning incident",
        "Heat exhaustion case",
    ]

    for _ in range(20):  # Generate 20 emergencies
        status = random.choice(status_choices)
        severity = random.choice(severity_choices)

        emergency = MedicalEmergency.objects.create(
            incident_id=f"MED-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000,9999)}",
            location_lat=random.uniform(LAT_MIN, LAT_MAX),
            location_lng=random.uniform(LNG_MIN, LNG_MAX),
            description=random.choice(emergency_descriptions),
            severity=severity,
            status=status,
            assigned_facility=(
                random.choice(facilities) if status != "REPORTED" else None
            ),
            assignment_time=(
                timezone.now() - timedelta(hours=random.randint(1, 48))
                if status != "REPORTED"
                else None
            ),
            resolution_notes=(
                "Case resolved successfully" if status in ["RESOLVED", "CLOSED"] else ""
            ),
            resolved_time=timezone.now() if status in ["RESOLVED", "CLOSED"] else None,
        )
        emergencies.append(emergency)
        print(f"Created emergency: {emergency.incident_id}")

    return emergencies


def generate_status_reports(facilities):
    """Generate facility status reports"""
    print("\nGenerating facility status reports...")
    reports = []

    # Get medical and emergency personnel
    medical_personnel = User.objects.filter(role="MEDICAL_PERSONNEL")
    emergency_personnel = User.objects.filter(role="EMERGENCY_PERSONNEL")

    if not medical_personnel or not emergency_personnel:
        print(
            "Warning: No medical or emergency personnel found. Make sure to run generate_test_users.py first."
        )
        return []

    report_titles = [
        "Daily Facility Status Update",
        "Emergency Resource Shortage Alert",
        "Critical Staff Shortage Notice",
        "Equipment Malfunction Report",
        "Capacity Status Update",
        "Power Supply Issues Alert",
        "Water System Status Report",
        "Medical Supply Inventory Alert",
        "Facility Maintenance Status",
        "Emergency Response Capability Update",
    ]

    for _ in range(15):  # Generate 15 reports
        reporter = random.choice(medical_personnel)
        priority = random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        is_acknowledged = random.choice([True, False])

        report = FacilityStatusReport.objects.create(
            reporter=reporter,
            priority=priority,
            title=random.choice(report_titles),
            description=f"Status report for affected facilities. Priority level: {priority}. "
            f"Requiring immediate attention and resource allocation.",
            acknowledged=is_acknowledged,
            acknowledged_by=(
                random.choice(emergency_personnel) if is_acknowledged else None
            ),
            acknowledged_at=(
                timezone.now() - timedelta(hours=random.randint(1, 24))
                if is_acknowledged
                else None
            ),
        )

        # Add 1-3 random facilities to each report
        report_facilities = random.sample(facilities, random.randint(1, 3))
        report.facilities.set(report_facilities)

        reports.append(report)
        print(f"Created status report: {report.title}")

    return reports


def main():
    """Main function to generate all medical test data"""
    print("Starting medical test data generation...")

    # Clear existing data
    print("\nClearing existing medical data...")
    FacilityStatusReport.objects.all().delete()
    MedicalEmergency.objects.all().delete()
    MedicalSupply.objects.all().delete()
    MedicalFacility.objects.all().delete()

    # Generate new data
    facilities = generate_medical_facilities()
    supplies = generate_medical_supplies(facilities)
    emergencies = generate_medical_emergencies(facilities)
    reports = generate_status_reports(facilities)

    print("\nMedical test data generation completed!")
    print(f"Generated {len(facilities)} facilities")
    print(f"Generated {len(supplies)} supplies")
    print(f"Generated {len(emergencies)} emergencies")
    print(f"Generated {len(reports)} status reports")


if __name__ == "__main__":
    main()
