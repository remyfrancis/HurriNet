"""
Tests for the chats app.

This module contains test cases for:
1. Direct message conversations
2. Message handling
3. Chat permissions
4. Real-time communication
"""

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import CustomGroup
from chats.models import ChatSession, ChatMessage
from chats.serializers import ChatSessionSerializer, ChatMessageSerializer

User = get_user_model()


class ChatSessionTests(TestCase):
    """Test cases for direct messaging conversations."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()

        # Create test users
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            password="user1pass",
            first_name="User",
            last_name="One",
            role="CITIZEN",
            address="Location 1",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            password="user2pass",
            first_name="User",
            last_name="Two",
            role="EMERGENCY_PERSONNEL",
            address="Location 2",
        )

        # Create test chat session
        self.chat_session = ChatSession.objects.create(
            initiator=self.user1, recipient=self.user2, status="active"
        )

        # Set up API endpoints
        self.chat_session_list_url = "/api/chats/sessions/"
        self.chat_session_detail_url = f"/api/chats/sessions/{self.chat_session.id}/"

    def test_start_chat_session(self):
        """Test starting a new chat session with another user."""
        self.client.force_authenticate(user=self.user1)
        data = {"recipient": self.user2.id}
        response = self.client.post(self.chat_session_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Since we already have an active session between these users,
        # it should return the existing session instead of creating a new one
        self.assertEqual(ChatSession.objects.count(), 1)
        session = ChatSession.objects.first()
        self.assertEqual(session.initiator, self.user1)
        self.assertEqual(session.recipient, self.user2)
        self.assertEqual(session.status, "active")

    def test_list_chat_sessions(self):
        """Test listing user's chat sessions."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.chat_session_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_chat_session(self):
        """Test retrieving a specific chat session."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.chat_session_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["initiator"]["id"], self.user1.id)
        self.assertEqual(response.data["recipient"]["id"], self.user2.id)


class ChatMessageTests(TestCase):
    """Test cases for chat messages."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()

        # Create test users
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            password="user1pass",
            first_name="User",
            last_name="One",
            role="CITIZEN",
            address="Location 1",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            password="user2pass",
            first_name="User",
            last_name="Two",
            role="EMERGENCY_PERSONNEL",
            address="Location 2",
        )

        # Create test chat session
        self.chat_session = ChatSession.objects.create(
            initiator=self.user1, recipient=self.user2, status="active"
        )

        # Create test message
        self.message = ChatMessage.objects.create(
            session=self.chat_session,
            sender=self.user1,
            content="Test message",
            message_type="text",
        )

        # Set up API endpoints
        self.message_list_url = "/api/chats/messages/"
        self.message_detail_url = f"/api/chats/messages/{self.message.id}/"

    def test_send_message(self):
        """Test sending a message in a chat session."""
        self.client.force_authenticate(user=self.user1)
        data = {
            "session": self.chat_session.id,
            "content": "New test message",
            "message_type": "text",
        }
        response = self.client.post(self.message_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChatMessage.objects.count(), 2)
        self.assertEqual(
            ChatMessage.objects.latest("created_at").content, "New test message"
        )

    def test_list_messages(self):
        """Test listing messages in a chat session."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(
            f"{self.message_list_url}?session={self.chat_session.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_message(self):
        """Test retrieving a specific message."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.message_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["content"], "Test message")


class ChatPermissionTests(TestCase):
    """Test cases for chat permissions."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()

        # Create test users
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            password="user1pass",
            first_name="User",
            last_name="One",
            role="CITIZEN",
            address="Location 1",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            password="user2pass",
            first_name="User",
            last_name="Two",
            role="EMERGENCY_PERSONNEL",
            address="Location 2",
        )
        self.user3 = User.objects.create_user(
            email="user3@example.com",
            password="user3pass",
            first_name="User",
            last_name="Three",
            role="CITIZEN",
            address="Location 3",
        )

        # Create test chat session
        self.chat_session = ChatSession.objects.create(
            initiator=self.user1, recipient=self.user2, status="active"
        )

    def test_chat_session_access(self):
        """Test that only participants can access their chat sessions."""
        # Test with participant (initiator)
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/chats/sessions/{self.chat_session.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test with participant (recipient)
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f"/api/chats/sessions/{self.chat_session.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test with non-participant
        self.client.force_authenticate(user=self.user3)
        response = self.client.get(f"/api/chats/sessions/{self.chat_session.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_message_permissions(self):
        """Test message permissions in chat sessions."""
        # Test sending message as participant
        self.client.force_authenticate(user=self.user1)
        data = {
            "session": self.chat_session.id,
            "content": "Test message",
            "message_type": "text",
        }
        response = self.client.post("/api/chats/messages/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test sending message as non-participant
        self.client.force_authenticate(user=self.user3)
        response = self.client.post("/api/chats/messages/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
