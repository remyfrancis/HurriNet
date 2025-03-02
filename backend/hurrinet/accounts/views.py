"""
Views for user authentication and management in the HurriNet application.

This module provides ViewSets for:
1. Authentication operations (register, login)
2. User management (CRUD operations)

The views implement proper permission checks and logging for security
and debugging purposes.
"""

import logging
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer

# Configure logging for this module
logger = logging.getLogger(__name__)


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet for handling authentication operations.

    This ViewSet provides endpoints for:
    1. User registration
    2. User login

    All endpoints are publicly accessible (AllowAny permission)
    but implement proper validation and security measures.
    """

    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def register(self, request):
        """
        Register a new user in the system.

        This endpoint:
        1. Validates the registration data
        2. Creates a new user account
        3. Generates authentication tokens
        4. Returns user data and tokens

        Request Body:
            - email: User's email address
            - password: User's password
            - first_name: User's first name
            - last_name: User's last name
            - role: User's role in the system
            - Additional fields as defined in RegisterSerializer

        Returns:
            200: Successfully registered user with tokens
            400: Invalid registration data
        """
        # Log the incoming request data
        logger.info(f"Registration request data: {request.data}")

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "user": UserSerializer(user).data,
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "message": "Registration successful",
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                return Response(
                    {"error": str(e), "message": "Registration failed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Log validation errors
        logger.error(f"Validation errors: {serializer.errors}")
        return Response(
            {"error": serializer.errors, "message": "Invalid data provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["post"])
    def login(self, request):
        """
        Authenticate a user and provide access tokens.

        This endpoint:
        1. Validates login credentials
        2. Authenticates the user
        3. Generates new authentication tokens

        Request Body:
            - email: User's email address
            - password: User's password

        Returns:
            200: Successfully authenticated with tokens
            400: Missing credentials
            401: Invalid credentials
        """
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(email=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user accounts.

    This ViewSet provides CRUD operations for user accounts with proper
    permission checks. Regular users can only access their own data,
    while staff users can access all user data.

    Endpoints require authentication (IsAuthenticated permission).
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        """
        Get the list of users accessible to the current user.

        Returns:
            QuerySet: All users if staff user, otherwise only the current user
        """
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
