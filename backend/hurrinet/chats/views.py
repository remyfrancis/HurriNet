"""
Views for the chat functionality in HurriNet.

This module provides views for managing chat sessions and messages,
including WebSocket support for real-time messaging.
"""

from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from django.utils import timezone
from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer,
    ChatSessionCreateSerializer,
    ChatMessageSerializer,
)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat sessions.

    Provides endpoints for:
    - Listing user's chat sessions
    - Creating new chat sessions
    - Retrieving specific chat sessions
    - Closing chat sessions
    - Marking messages as read
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionSerializer

    def get_queryset(self):
        """
        Get chat sessions where the current user is either initiator or recipient.
        """
        user = self.request.user
        return ChatSession.objects.filter(
            Q(initiator=user) | Q(recipient=user)
        ).order_by("-updated_at")

    def get_serializer_class(self):
        """Use different serializers for list/retrieve and create actions."""
        if self.action == "create":
            return ChatSessionCreateSerializer
        return ChatSessionSerializer

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        """Close a chat session."""
        chat_session = self.get_object()
        if chat_session.can_participate(request.user):
            chat_session.status = "closed"
            chat_session.closed_at = timezone.now()
            chat_session.save()
            return Response(
                self.get_serializer(chat_session).data, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Not authorized to close this chat session"},
            status=status.HTTP_403_FORBIDDEN,
        )

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """Mark all messages in the session as read for the current user."""
        chat_session = self.get_object()
        if chat_session.can_participate(request.user):
            unread_messages = chat_session.messages.filter(read=False).exclude(
                sender=request.user
            )
            unread_messages.update(read=True)
            return Response(
                self.get_serializer(chat_session).data, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Not authorized to access this chat session"},
            status=status.HTTP_403_FORBIDDEN,
        )


class ChatMessageViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for managing chat messages.

    Provides endpoints for:
    - Creating new messages
    - Retrieving message history
    - Listing messages in a chat session
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        """Get messages for a specific chat session."""
        user = self.request.user
        session_id = self.request.query_params.get("session")

        # Base queryset
        queryset = ChatMessage.objects.all()

        # Filter by session if provided
        if session_id:
            queryset = queryset.filter(session_id=session_id)

        # Filter to only show messages from sessions where the user is a participant
        return queryset.filter(
            Q(session__initiator=user) | Q(session__recipient=user)
        ).order_by("created_at")

    def perform_create(self, serializer):
        """Create a new message and set the sender."""
        chat_session = serializer.validated_data["session"]
        if not chat_session.can_participate(self.request.user):
            raise PermissionDenied(
                "Not authorized to send messages in this chat session"
            )
        serializer.save(sender=self.request.user)
