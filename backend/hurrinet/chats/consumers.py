import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope["url_route"]["kwargs"]["session_id"]
        self.room_group_name = f"chat_{self.session_id}"
        self.user = self.scope["user"]

        # Check if user can access this chat
        can_access = await self.can_access_chat()
        if not can_access:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Save message to database
        chat_message = await self.save_message(message)
        if not chat_message:
            return

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": chat_message}
        )

    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def can_access_chat(self):
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
        try:
            session = ChatSession.objects.get(id=self.session_id)
            if not session.can_participate(self.user):
                return None

            message = ChatMessage.objects.create(
                session=session, sender=self.user, content=content, message_type="text"
            )

            # Use the serializer to format the message
            serializer = ChatMessageSerializer(message)
            return serializer.data
        except ChatSession.DoesNotExist:
            return None
