import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Incident
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)


class IncidentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get the token from query string
            query_string = self.scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]

            if not token:
                logger.warning("⚠️ WebSocket connection rejected: No token provided")
                await self.close()
                return

            # Authenticate the user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("⚠️ WebSocket connection rejected: Authentication failed")
                await self.close()
                return

            # Accept the connection
            await self.accept()
            logger.info(f"🟢 WebSocket connection established for user {user.email}")

            # Add the user to the incident group
            await self.channel_layer.group_add("incidents", self.channel_name)
            logger.info(f"➕ User {user.email} added to incidents group")

        except Exception as e:
            logger.error(f"❌ Error in WebSocket connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            # Remove the user from the incident group
            await self.channel_layer.group_discard("incidents", self.channel_name)
            logger.info(f"🔴 WebSocket disconnected with code {close_code}")
        except Exception as e:
            logger.error(f"❌ Error in WebSocket disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get("type")

            if message_type == "incident_update":
                # Broadcast the update to all connected clients
                await self.channel_layer.group_send(
                    "incidents",
                    {"type": "incident_update", "data": text_data_json.get("data")},
                )
                logger.info(
                    f"📢 Broadcasted incident update: {text_data_json.get('data')}"
                )
        except Exception as e:
            logger.error(f"❌ Error in WebSocket receive: {str(e)}")

    async def incident_update(self, event):
        try:
            # Send the update to the WebSocket
            await self.send(text_data=json.dumps(event["data"]))
            logger.info(f"📤 Sent incident update to client: {event['data']}")
        except Exception as e:
            logger.error(f"❌ Error in incident_update: {str(e)}")

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith("Bearer "):
                token = token.split(" ")[1]

            # Get the user from the token
            from django.contrib.auth import get_user_model
            from rest_framework_simplejwt.tokens import AccessToken

            User = get_user_model()
            access_token = AccessToken(token)
            user_id = access_token.payload.get("user_id")
            user = User.objects.get(id=user_id)
            logger.info(f"✅ Successfully authenticated user: {user.email}")
            return user
        except Exception as e:
            logger.error(f"❌ Error authenticating user: {str(e)}")
            return None
