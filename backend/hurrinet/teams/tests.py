from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Team, TeamMember

User = get_user_model()


class TeamModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.team = Team.objects.create(
            name="Test Team", team_type="MEDICAL", leader=self.user
        )

    def test_team_creation(self):
        self.assertEqual(self.team.name, "Test Team")
        self.assertEqual(self.team.team_type, "MEDICAL")
        self.assertEqual(self.team.leader, self.user)
        self.assertTrue(self.team.is_active)

    def test_team_str_representation(self):
        self.assertEqual(str(self.team), "Test Team (Medical Response)")


class TeamMemberModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="member@example.com",
            password="testpass123",
            first_name="Team",
            last_name="Member",
        )
        self.team = Team.objects.create(name="Test Team", team_type="MEDICAL")
        self.team_member = TeamMember.objects.create(
            team=self.team, user=self.user, role="MEMBER"
        )

    def test_team_member_creation(self):
        self.assertEqual(self.team_member.team, self.team)
        self.assertEqual(self.team_member.user, self.user)
        self.assertEqual(self.team_member.role, "MEMBER")
        self.assertEqual(self.team_member.status, "ACTIVE")


class TeamAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="api@example.com",
            password="testpass123",
            first_name="API",
            last_name="User",
            role="ADMINISTRATOR",
        )
        self.client.force_authenticate(user=self.user)
        self.team_data = {
            "name": "API Test Team",
            "team_type": "MEDICAL",
            "description": "Test team created via API",
        }

    def test_create_team(self):
        response = self.client.post("/api/teams/", self.team_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.get().name, "API Test Team")

    def test_list_teams(self):
        Team.objects.create(**self.team_data)
        response = self.client.get("/api/teams/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_team(self):
        team = Team.objects.create(**self.team_data)
        response = self.client.patch(
            f"/api/teams/{team.id}/", {"name": "Updated Team Name"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Team.objects.get(id=team.id).name, "Updated Team Name")


class TeamMemberAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="leader@example.com",
            password="testpass123",
            first_name="Team",
            last_name="Leader",
            role="ADMINISTRATOR",
        )
        self.team = Team.objects.create(
            name="Test Team", team_type="MEDICAL", leader=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_add_team_member(self):
        new_member = User.objects.create_user(
            email="member@example.com",
            password="testpass123",
            first_name="New",
            last_name="Member",
        )
        response = self.client.post(
            f"/api/teams/{self.team.id}/add_member/", {"user_id": new_member.id}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TeamMember.objects.filter(team=self.team, user=new_member).exists()
        )

    def test_remove_team_member(self):
        member = User.objects.create_user(
            email="remove@example.com",
            password="testpass123",
            first_name="Remove",
            last_name="Member",
        )
        team_member = TeamMember.objects.create(team=self.team, user=member)
        response = self.client.post(
            f"/api/teams/{self.team.id}/remove_member/", {"user_id": member.id}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TeamMember.objects.filter(id=team_member.id).exists())
