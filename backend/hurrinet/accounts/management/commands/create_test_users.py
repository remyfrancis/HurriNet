from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = "Creates test users for all roles in the system"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Generating test users for HurriNet..."))

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
                self.stdout.write(
                    f"User {user_data['email']} already exists. Skipping."
                )
                continue

            # Create user
            try:
                user = User.objects.create_user(**user_data)
                created_users.append(user)
                self.stdout.write(
                    self.style.SUCCESS(f"Created {user.role} user: {user.email}")
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"Error creating user {user_data['email']}: {str(e)}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"Created {len(created_users)} test users.")
        )

        # Print credentials
        self.stdout.write("\nTest User Credentials:")
        self.stdout.write("======================")
        for user_data in [
            {
                "role": "ADMINISTRATOR",
                "email": "admin@hurrinet.org",
                "password": "Admin123!",
            },
            {
                "role": "CITIZEN",
                "email": "citizen@hurrinet.org",
                "password": "Citizen123!",
            },
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
            self.stdout.write(f"{user_data['role']}:")
            self.stdout.write(f"  Email: {user_data['email']}")
            self.stdout.write(f"  Password: {user_data['password']}")
            self.stdout.write("")
