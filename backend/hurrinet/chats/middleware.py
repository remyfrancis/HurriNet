"""
WebSocket authentication middleware for the Chat application.

This module provides JWT token-based authentication for WebSocket connections,
allowing secure access to chat sessions through token validation in the
query string parameters.
"""

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

# Get the active User model as defined in settings
User = get_user_model()


@database_sync_to_async
def get_user_from_token(token):
    """
    Asynchronously validate JWT token and retrieve corresponding user.

    Args:
        token (str): JWT access token from query string

    Returns:
        User: Authenticated user if token is valid
        AnonymousUser: If token is invalid or user not found

    Note:
        Uses database_sync_to_async decorator to make synchronous Django ORM
        operations safe in asynchronous context.
    """
    try:
        # Validate the JWT token and extract user ID
        access_token = AccessToken(token)
        user = User.objects.get(id=access_token["user_id"])
        return user
    except (InvalidToken, TokenError, User.DoesNotExist):
        # Return anonymous user if token is invalid or user doesn't exist
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    """
    Middleware for authenticating WebSocket connections using JWT tokens.

    Extracts JWT token from WebSocket connection query parameters and
    authenticates the user before allowing access to WebSocket consumers.

    Example query string:
        ws://example.com/ws/chat/?token=<jwt_token>
    """

    async def __call__(self, scope, receive, send):
        """
        Process WebSocket connection request with authentication.

        Args:
            scope (dict): Connection scope containing request details
            receive (callable): Channel receive function
            send (callable): Channel send function

        Returns:
            callable: Next middleware or consumer in the chain

        Note:
            Sets authenticated user or AnonymousUser in the scope for
            use by subsequent middleware and consumers.
        """
        # Extract and decode query string from connection scope
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)

        # Get token from query parameters, defaulting to None if not present
        token = query_params.get("token", [None])[0]

        if token:
            # Authenticate user if token is provided
            scope["user"] = await get_user_from_token(token)
        else:
            # Set anonymous user if no token provided
            scope["user"] = AnonymousUser()

        # Continue processing the request
        return await super().__call__(scope, receive, send)
