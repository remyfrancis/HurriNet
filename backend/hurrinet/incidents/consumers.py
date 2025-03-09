import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Incident
from urllib.parse import parse_qs


class IncidentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get the token from query string
            query_string = self.scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]

            if not token:
                print("No token provided")
                await self.close()
                return

            # Authenticate the user
            user = await self.get_user_from_token(token)
            if not user:
                print("Failed to authenticate user")
                await self.close()
                return

            # Accept the connection
            await self.accept()
            print(f"WebSocket connection accepted for user {user.id}")

            # Add the user to the incident group
            await self.channel_layer.group_add("incidents", self.channel_name)
            print(f"User {user.id} added to incidents group")

        except Exception as e:
            print(f"Error in WebSocket connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            # Remove the user from the incident group
            await self.channel_layer.group_discard("incidents", self.channel_name)
            print(f"User disconnected with code {close_code}")
        except Exception as e:
            print(f"Error in WebSocket disconnect: {str(e)}")

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
                print(f"Broadcasted incident update: {text_data_json.get('data')}")
        except Exception as e:
            print(f"Error in WebSocket receive: {str(e)}")

    async def incident_update(self, event):
        try:
            # Send the update to the WebSocket
            await self.send(text_data=json.dumps(event["data"]))
            print(f"Sent incident update to client: {event['data']}")
        except Exception as e:
            print(f"Error in incident_update: {str(e)}")

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
            return User.objects.get(id=user_id)
        except Exception as e:
            print(f"Error authenticating user: {str(e)}")
            return None
