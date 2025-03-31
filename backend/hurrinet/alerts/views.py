"""
Views for the Alerts application.

This module provides the ViewSet for handling Alert-related API endpoints,
including listing, creating, updating, and filtering alerts based on various criteria.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Alert
from .serializers import AlertSerializer


class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Alert objects.

    Provides CRUD operations and custom endpoints for alert management.
    Implements filtering based on active status and district, with different
    visibility rules for staff and regular users.
    """

    # Base queryset and configuration
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]  # Requires users to be logged in

    def get_queryset(self):
        """
        Get the list of alerts filtered based on user permissions and query parameters.

        Regular users can only see public alerts, while staff can see all alerts.
        Supports filtering by:
        - active status (boolean)
        - district (string)

        Returns:
            QuerySet: Filtered queryset of Alert objects
        """
        queryset = Alert.objects.all()

        # Regular users can only see public alerts
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_public=True)

        # Filter by active status if provided in query params
        active = self.request.query_params.get("active", None)
        if active is not None:
            queryset = queryset.filter(is_active=active.lower() == "true")

        # Filter by district if provided in query params
        district = self.request.query_params.get("district", None)
        if district:
            queryset = queryset.filter(district=district)

        return queryset

    def perform_create(self, serializer):
        """
        Override create method to automatically set the alert creator.

        Args:
            serializer: The AlertSerializer instance with validated data
        """
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def current(self, request):
        """
        Custom endpoint to retrieve all currently active alerts.

        Endpoint: GET /api/alerts/current/
        Returns an empty array if no active alerts exist.

        Returns:
            Response: Serialized list of active alerts, ordered by creation date
        """
        # Get all active alerts, newest first
        active_alerts = Alert.objects.filter(is_active=True).order_by("-created_at")

        # Return empty array if no active alerts found
        if not active_alerts.exists():
            return Response([])

        serializer = self.get_serializer(active_alerts, many=True)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """
        Handle PATCH requests to update alerts partially.

        Allows updating specific fields of an alert without requiring all fields
        to be present in the request.

        Returns:
            Response: Updated alert data
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
