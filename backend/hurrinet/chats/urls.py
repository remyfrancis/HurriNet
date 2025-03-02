"""
URL configuration for the chats app.

This module defines the URL patterns for chat-related endpoints,
including session management and message handling.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, ChatMessageViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()

# Chat session endpoints:
# - GET /api/chats/sessions/ (list sessions)
# - POST /api/chats/sessions/ (create session)
# - GET /api/chats/sessions/{id}/ (get session)
# - POST /api/chats/sessions/{id}/close/ (close session)
# - POST /api/chats/sessions/{id}/mark_read/ (mark messages as read)
router.register("sessions", ChatSessionViewSet, basename="chat-session")

# Chat message endpoints:
# - GET /api/chats/messages/?session={id} (list messages)
# - POST /api/chats/messages/ (create message)
# - GET /api/chats/messages/{id}/ (get message)
router.register("messages", ChatMessageViewSet, basename="chat-message")

urlpatterns = [
    path("", include(router.urls)),
]
