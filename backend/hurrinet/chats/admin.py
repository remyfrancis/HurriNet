"""
Admin configuration for the chats app.

This module configures the admin interface for managing chat sessions
and messages in the HurriNet application.
"""

from django.contrib import admin
from .models import ChatSession, ChatMessage


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    """
    Admin configuration for ChatSession model.

    Provides a customized interface for managing chat sessions with:
    - List display showing key information
    - Filtering options
    - Search functionality
    """

    list_display = (
        "id",
        "initiator",
        "recipient",
        "status",
        "created_at",
        "updated_at",
        "closed_at",
    )
    list_filter = ("status", "created_at", "updated_at")
    search_fields = ("initiator__email", "recipient__email")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """
    Admin configuration for ChatMessage model.

    Provides a customized interface for managing chat messages with:
    - List display showing key information
    - Filtering options
    - Search functionality
    """

    list_display = ("id", "session", "sender", "content", "created_at", "read")
    list_filter = ("read", "created_at")
    search_fields = ("content", "sender__email")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
