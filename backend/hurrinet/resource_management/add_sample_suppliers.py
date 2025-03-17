import os
import django
from django.contrib.gis.geos import Point

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
django.setup()

from resource_management.models import Supplier

# Sample suppliers data
sample_suppliers = [
    {
        "name": "St. Lucia Medical Supplies Ltd.",
        "supplier_type": "MEDICAL",
        "description": "Leading provider of medical supplies in St. Lucia",
        "contact_name": "John Smith",
        "email": "info@slmedsupplies.com",
        "phone": "+1 758-123-4567",
        "address": "Castries, St. Lucia",
        "website": "https://www.slmedsupplies.com",
        "status": "ACTIVE",
        "notes": "",
        "location": Point(-60.9789, 14.0101),  # Approximate coordinates for Castries
    },
    {
        "name": "Caribbean Food Distributors",
        "supplier_type": "FOOD",
        "description": "Regional distributor of food and water supplies",
        "contact_name": "Maria Rodriguez",
        "email": "orders@caribfood.com",
        "phone": "+1 758-234-5678",
        "address": "Vieux Fort, St. Lucia",
        "website": "https://www.caribfood.com",
        "status": "ACTIVE",
        "notes": "Preferred supplier for emergency food supplies",
        "location": Point(-60.9498, 13.7246),  # Approximate coordinates for Vieux Fort
    },
    {
        "name": "Island Water Company",
        "supplier_type": "FOOD",
        "description": "Local water supplier with emergency response capabilities",
        "contact_name": "David Johnson",
        "email": "sales@islandwater.com",
        "phone": "+1 758-345-6789",
        "address": "Soufriere, St. Lucia",
        "website": "https://www.islandwater.com",
        "status": "ACTIVE",
        "notes": "",
        "location": Point(-61.0587, 13.8566),  # Approximate coordinates for Soufriere
    },
    {
        "name": "Caribbean Shelter Solutions",
        "supplier_type": "SHELTER",
        "description": "Provider of emergency shelter materials and solutions",
        "contact_name": "Sarah Williams",
        "email": "contact@caribshelter.com",
        "phone": "+1 758-456-7890",
        "address": "Gros Islet, St. Lucia",
        "website": "https://www.caribshelter.com",
        "status": "ACTIVE",
        "notes": "Specializes in rapid deployment shelters",
        "location": Point(-60.9443, 14.0833),  # Approximate coordinates for Gros Islet
    },
    {
        "name": "Emergency Equipment Ltd.",
        "supplier_type": "EQUIPMENT",
        "description": "Supplier of emergency response equipment",
        "contact_name": "Robert Brown",
        "email": "info@emergencyequip.com",
        "phone": "+1 758-567-8901",
        "address": "Castries, St. Lucia",
        "website": "https://www.emergencyequip.com",
        "status": "INACTIVE",
        "notes": "Currently undergoing contract renewal",
        "location": Point(-60.9789, 14.0101),  # Approximate coordinates for Castries
    },
]


def add_sample_suppliers():
    """Add sample suppliers to the database"""
    created_count = 0
    updated_count = 0

    for supplier_data in sample_suppliers:
        supplier, created = Supplier.objects.update_or_create(
            name=supplier_data["name"], defaults=supplier_data
        )

        if created:
            created_count += 1
            print(f"Created supplier: {supplier.name}")
        else:
            updated_count += 1
            print(f"Updated supplier: {supplier.name}")

    print(
        f"\nSummary: Created {created_count} suppliers, Updated {updated_count} suppliers"
    )


if __name__ == "__main__":
    print("Adding sample suppliers to the database...")
    add_sample_suppliers()
    print("Done!")
