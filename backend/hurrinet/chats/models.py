"""
Models for the chat functionality in HurriNet.

This module defines the models for managing chat sessions and messages
between users in the HurriNet application.
"""

from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    """
    Model representing a chat session between two users.

    A chat session is created when one user initiates a conversation with another user.
    The session tracks the status of the conversation and timestamps for various events.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("closed", "Closed"),
        ("blocked", "Blocked"),
    ]

    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="initiated_chats",
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_chats",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Chat between {self.initiator.email} and {self.recipient.email}"

    def can_participate(self, user):
        """
        Check if a user can participate in this chat session.

        Args:
            user: The user to check

        Returns:
            bool: True if the user is either the initiator or recipient and the chat is active
        """
        is_participant = user in [self.initiator, self.recipient]
        return is_participant and self.status == "active"


class ChatMessage(models.Model):
    """
    Model representing a message within a chat session.

    Each message belongs to a chat session and is sent by one of the participants.
    Messages can have different types (text, image, file) and include attachments.
    Messages track their creation time and read status.
    """

    MESSAGE_TYPES = [
        ("text", "Text Message"),
        ("image", "Image Message"),
        ("file", "File Attachment"),
        ("emergency", "Emergency Alert"),
        ("location", "Location Share"),
    ]

    session = models.ForeignKey(
        ChatSession, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    message_type = models.CharField(
        max_length=20, choices=MESSAGE_TYPES, default="text"
    )
    content = models.TextField()
    attachment = models.FileField(
        upload_to="chat_attachments/%Y/%m/%d/", null=True, blank=True
    )
    attachment_name = models.CharField(max_length=255, null=True, blank=True)
    attachment_type = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.get_message_type_display()} from {self.sender.email} at {self.created_at}"

    def save(self, *args, **kwargs):
        """
        Override save method to update attachment information
        and session's updated_at timestamp.
        """
        if self.attachment:
            self.attachment_name = self.attachment.name.split("/")[-1]
            self.attachment_type = self.attachment.name.split(".")[-1].lower()

        super().save(*args, **kwargs)

        # Update the session's updated_at timestamp
        self.session.save()
