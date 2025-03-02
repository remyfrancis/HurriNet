"""
Serializers for the chat functionality in HurriNet.

This module provides serializers for converting chat models to/from JSON
and handling nested relationships between models.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatSession, ChatMessage
from django.db import models

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for basic user information in chat contexts.
    """

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")
        read_only_fields = fields


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for chat messages.

    Includes sender information and handles file attachments.
    """

    sender = UserSerializer(read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = (
            "id",
            "session",
            "sender",
            "message_type",
            "content",
            "attachment",
            "attachment_url",
            "attachment_name",
            "attachment_type",
            "created_at",
            "read",
        )
        read_only_fields = ("sender", "attachment_name", "attachment_type")

    def get_attachment_url(self, obj):
        """Get the full URL for the attachment if it exists."""
        if obj.attachment:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for chat sessions.

    Includes information about participants and the latest message.
    """

    initiator = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    latest_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = (
            "id",
            "initiator",
            "recipient",
            "status",
            "created_at",
            "updated_at",
            "closed_at",
            "latest_message",
            "unread_count",
        )
        read_only_fields = ("created_at", "updated_at", "closed_at")

    def get_latest_message(self, obj):
        """Get the most recent message in the chat session."""
        latest_message = obj.messages.first()  # Using the default ordering
        if latest_message:
            return ChatMessageSerializer(latest_message, context=self.context).data
        return None

    def get_unread_count(self, obj):
        """Get the count of unread messages for the current user."""
        user = self.context["request"].user
        return obj.messages.filter(read=False).exclude(sender=user).count()


class ChatSessionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new chat sessions.

    Only requires the recipient ID to create a new chat session.
    """

    class Meta:
        model = ChatSession
        fields = ("recipient",)

    def create(self, validated_data):
        """Create a new chat session with the current user as initiator."""
        initiator = self.context["request"].user
        recipient = validated_data["recipient"]

        # Check for existing active chat session
        existing_session = ChatSession.objects.filter(
            models.Q(initiator=initiator, recipient=recipient)
            | models.Q(initiator=recipient, recipient=initiator),
            status="active",
        ).first()

        if existing_session:
            return existing_session

        return ChatSession.objects.create(initiator=initiator, recipient=recipient)
