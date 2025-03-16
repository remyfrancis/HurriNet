#!/usr/bin/env python
"""
Script to generate test users for the HurriNet application.

This script creates test users for all roles defined in the system:
- Administrator
- Citizen
- Emergency Personnel
- Resource Manager
- Medical Personnel

Usage:
    python generate_test_users.py
"""

import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
django.setup()

# Check if accounts app is available
from django.conf import settings

if "accounts" not in [app.split(".")[-1] for app in settings.INSTALLED_APPS]:
    print("Accounts app is not installed. Using default User model.")
    from django.contrib.auth import get_user_model

    User = get_user_model()
else:
    from accounts.models import User


def create_test_users():
    """Create test users for all roles in the system."""

    # Define test users with their roles
    test_users = [
        {
            "email": "admin@hurrinet.org",
            "password": "Admin123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": "ADMINISTRATOR",
            "address": "123 Admin St, Castries, Saint Lucia",
            "phone_number": "+1758555000",
        },
        {
            "email": "citizen@hurrinet.org",
            "password": "Citizen123!",
            "first_name": "Citizen",
            "last_name": "User",
            "role": "CITIZEN",
            "address": "456 Resident Ave, Gros Islet, Saint Lucia",
            "phone_number": "+1758555001",
        },
        {
            "email": "emergency@hurrinet.org",
            "password": "Emergency123!",
            "first_name": "Emergency",
            "last_name": "Responder",
            "role": "EMERGENCY_PERSONNEL",
            "address": "789 Response Rd, Soufriere, Saint Lucia",
            "phone_number": "+1758555002",
            "first_responder_id": "ER12345",
        },
        {
            "email": "resource@hurrinet.org",
            "password": "Resource123!",
            "first_name": "Resource",
            "last_name": "Manager",
            "role": "RESOURCE_MANAGER",
            "address": "101 Supply St, Vieux Fort, Saint Lucia",
            "phone_number": "+1758555003",
        },
        {
            "email": "medical@hurrinet.org",
            "password": "Medical123!",
            "first_name": "Medical",
            "last_name": "Personnel",
            "role": "MEDICAL_PERSONNEL",
            "address": "202 Hospital Dr, Castries, Saint Lucia",
            "phone_number": "+1758555004",
            "medical_license_id": "ML67890",
        },
    ]

    # Create users
    created_users = []
    for user_data in test_users:
        # Check if user already exists
        if User.objects.filter(email=user_data["email"]).exists():
            print(f"User {user_data['email']} already exists. Skipping.")
            continue

        # Create user
        try:
            user = User.objects.create_user(**user_data)
            created_users.append(user)
            print(f"Created {user.role} user: {user.email}")
        except Exception as e:
            print(f"Error creating user {user_data['email']}: {str(e)}")

    return created_users


if __name__ == "__main__":
    print("Generating test users for HurriNet...")
    users = create_test_users()
    print(f"Created {len(users)} test users.")
    print("\nTest User Credentials:")
    print("======================")
    for user_data in [
        {
            "role": "ADMINISTRATOR",
            "email": "admin@hurrinet.org",
            "password": "Admin123!",
        },
        {"role": "CITIZEN", "email": "citizen@hurrinet.org", "password": "Citizen123!"},
        {
            "role": "EMERGENCY_PERSONNEL",
            "email": "emergency@hurrinet.org",
            "password": "Emergency123!",
        },
        {
            "role": "RESOURCE_MANAGER",
            "email": "resource@hurrinet.org",
            "password": "Resource123!",
        },
        {
            "role": "MEDICAL_PERSONNEL",
            "email": "medical@hurrinet.org",
            "password": "Medical123!",
        },
    ]:
        print(f"{user_data['role']}:")
        print(f"  Email: {user_data['email']}")
        print(f"  Password: {user_data['password']}")
        print()
