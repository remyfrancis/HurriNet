from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from teams.models import Team, TeamMember
from faker import Faker
import random

User = get_user_model()
fake = Faker()


class Command(BaseCommand):
    help = "Generate test data for Teams and TeamMembers"

    def add_arguments(self, parser):
        parser.add_argument(
            "--teams", type=int, default=5, help="Number of teams to create"
        )
        parser.add_argument(
            "--members_per_team", type=int, default=5, help="Number of members per team"
        )

    def handle(self, *args, **options):
        num_teams = options["teams"]
        members_per_team = options["members_per_team"]

        # Create test users if they don't exist
        self.stdout.write("Creating test users...")
        users = []
        for _ in range(num_teams * members_per_team):
            user = User.objects.create_user(
                email=fake.email(),
                password="testpass123",
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=random.choice(["MEDICAL_PERSONNEL", "EMERGENCY_PERSONNEL"]),
            )
            users.append(user)

        # Team configurations split by type
        medical_team_configs = {
            "EMERGENCY": ["Emergency Medicine", "Acute Care", "Critical Care"],
            "TRAUMA": [
                "Trauma Surgery",
                "Emergency Trauma Care",
                "Critical Trauma Care",
            ],
            "GENERAL": ["General Medicine", "Primary Care", "Preventive Care"],
            "SPECIALIZED": ["Cardiology", "Neurology", "Respiratory Care"],
        }

        emergency_team_configs = {
            "FIRST_RESPONSE": ["Search and Rescue", "Fire Response", "Hazmat Response"],
            "SEARCH_RESCUE": ["Urban Search", "Wilderness Rescue", "Water Rescue"],
            "EVACUATION": [
                "Urban Evacuation",
                "Coastal Evacuation",
                "Emergency Transport",
            ],
            "HAZMAT": [
                "Chemical Response",
                "Biological Response",
                "Radiological Response",
            ],
            "LOGISTICS": ["Supply Chain", "Resource Management", "Transportation"],
        }

        # Create medical teams
        self.stdout.write("Creating medical teams...")
        for i in range(num_teams // 2):  # Half medical teams
            team_type = random.choice(list(medical_team_configs.keys()))
            team = Team.objects.create(
                name=f"{fake.city()} {team_type.title().replace('_', ' ')} Team",
                description=fake.paragraph(),
                team_type="MEDICAL",
                specialty=team_type,  # Store the specific medical specialty
                status=random.choice(["ACTIVE", "ON_CALL", "OFF_DUTY"]),
                leader=random.choice(users),
                current_assignment=(
                    fake.sentence() if random.choice([True, False]) else None
                ),
                location=fake.city(),
                equipment=random.sample(
                    [
                        "First Aid Kit",
                        "Defibrillator",
                        "Medical Equipment",
                        "Communication Devices",
                        "Emergency Vehicle",
                        "Portable Medical Station",
                        "Vital Signs Monitor",
                        "Medical Supplies",
                        "Emergency Medications",
                        "Trauma Kit",
                    ],
                    k=random.randint(3, 6),
                ),
                notes=fake.text() if random.choice([True, False]) else "",
            )
            self._create_team_members(
                team, users, members_per_team, medical_team_configs[team_type]
            )

        # Create emergency teams
        self.stdout.write("Creating emergency teams...")
        for i in range(num_teams - num_teams // 2):  # Remaining as emergency teams
            team_type = random.choice(list(emergency_team_configs.keys()))
            team = Team.objects.create(
                name=f"{fake.city()} {team_type.title().replace('_', ' ')} Team",
                description=fake.paragraph(),
                team_type=team_type,
                status=random.choice(["DEPLOYED", "STANDBY", "OFF_DUTY"]),
                leader=random.choice(users),
                current_assignment=(
                    fake.sentence() if random.choice([True, False]) else None
                ),
                location=fake.city(),
                equipment=random.sample(
                    [
                        "Rescue Equipment",
                        "Communication Devices",
                        "Emergency Vehicle",
                        "Hazmat Suits",
                        "Search Lights",
                        "Rescue Ropes",
                        "Safety Gear",
                        "Emergency Shelter",
                        "Power Generator",
                        "Tactical Equipment",
                    ],
                    k=random.randint(3, 6),
                ),
                notes=fake.text() if random.choice([True, False]) else "",
            )
            self._create_team_members(
                team, users, members_per_team, emergency_team_configs[team_type]
            )

    def _create_team_members(self, team, users, members_per_team, specialties):
        """Helper method to create team members"""
        for _ in range(members_per_team):
            user = random.choice(users)
            if not TeamMember.objects.filter(team=team, user=user).exists():
                TeamMember.objects.create(
                    team=team,
                    user=user,
                    role=random.choice(
                        ["LEADER", "DEPUTY", "SPECIALIST", "MEMBER", "TRAINEE"]
                    ),
                    status=random.choice(["ACTIVE", "ON_CALL", "OFF_DUTY", "ON_LEAVE"]),
                    specialization=random.choice(specialties),
                    certifications=random.sample(
                        [
                            "Basic Life Support",
                            "Advanced First Aid",
                            "Emergency Response",
                            "Hazmat Handling",
                            "Search and Rescue",
                            "Crisis Management",
                            "Emergency Vehicle Operation",
                        ],
                        k=random.randint(2, 4),
                    ),
                    notes=fake.text() if random.choice([True, False]) else "",
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {num_teams} teams with {members_per_team} members each"
            )
        )
