"""
WebSocket consumer for the Chat application.

This module handles real-time chat functionality using Django Channels,
enabling bidirectional communication between clients and server for
instant messaging and read receipt features.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer

# Get the active User model as defined in settings
User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time chat communications.

    Manages WebSocket connections for chat sessions, including:
    - Connection authentication and access control
    - Real-time message broadcasting
    - Read receipt handling
    - Chat session management
    """

    async def connect(self):
        """
        Handle new WebSocket connection requests.

        Performs the following:
        1. Extracts session ID from URL
        2. Validates user's access to the chat session
        3. Adds user to the chat group if authorized
        4. Accepts or rejects the connection
        """
        self.session_id = self.scope["url_route"]["kwargs"]["session_id"]
        self.room_group_name = f"chat_{self.session_id}"
        self.user = self.scope["user"]

        # Verify user's authorization to access this chat session
        can_access = await self.can_access_chat()
        if not can_access:
            await self.close()
            return

        # Add user to the chat group for real-time updates
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.

        Removes the user from the chat group when they disconnect.
        """
        # Remove user from the chat group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Process incoming WebSocket messages.

        Handles two types of events:
        1. New chat messages
        2. Read receipt notifications

        Args:
            text_data (str): JSON string containing the message data
        """
        try:
            text_data_json = json.loads(text_data)

            # Process new chat message
            if "message" in text_data_json:
                message = text_data_json["message"]
                chat_message = await self.save_message(message)
                if chat_message:
                    # Broadcast the new message to all users in the chat
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "chat_message",
                            "message": chat_message,
                            "action": "new_message",
                        },
                    )

            # Process read receipt notification
            elif "mark_read" in text_data_json:
                success = await self.mark_messages_as_read()
                if success:
                    # Broadcast read receipt to all users in the chat
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "chat_message",
                            "action": "messages_read",
                            "user_id": self.user.id,
                        },
                    )
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error in receive: {str(e)}")

    async def chat_message(self, event):
        """
        Send message to WebSocket.

        Broadcasts the message to all connected clients in the chat session.

        Args:
            event (dict): Message data to be sent
        """
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def can_access_chat(self):
        """
        Check if the user has permission to access the chat session.

        Verifies that:
        1. User is authenticated
        2. User is either the initiator or recipient of the chat
        3. Chat session is active

        Returns:
            bool: True if user can access the chat, False otherwise
        """
        try:
            session = ChatSession.objects.get(id=self.session_id)
            return (
                self.user.is_authenticated
                and (self.user == session.initiator or self.user == session.recipient)
                and session.status == "active"
            )
        except ChatSession.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        """
        Save a new chat message to the database.

        Args:
            content (str): Message content to be saved

        Returns:
            dict: Serialized message data if successful, None if failed
        """
        try:
            session = ChatSession.objects.get(id=self.session_id)
            if not session.can_participate(self.user):
                return None

            # Create and save the new message
            message = ChatMessage.objects.create(
                session=session, sender=self.user, content=content, message_type="text"
            )

            # Serialize the message for broadcasting
            serializer = ChatMessageSerializer(message)
            return serializer.data
        except ChatSession.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_messages_as_read(self):
        """
        Mark all unread messages in the session as read.

        Marks messages as read only if:
        1. Chat session exists
        2. User is a participant
        3. Messages were sent by the other participant

        Returns:
            bool: True if messages were marked as read, False otherwise
        """
        try:
            session = ChatSession.objects.get(id=self.session_id)
            if session.can_participate(self.user):
                # Update all unread messages from other participants
                ChatMessage.objects.filter(session=session, read=False).exclude(
                    sender=self.user
                ).update(read=True)
                return True
            return False
        except ChatSession.DoesNotExist:
            return False
