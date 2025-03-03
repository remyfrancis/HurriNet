"""
Views for incident reporting in HurriNet.

This module provides views for managing incidents, updates, and flags.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q
from .models import Incident, IncidentUpdate, IncidentFlag
from .serializers import (
    IncidentSerializer,
    IncidentCreateSerializer,
    IncidentUpdateSerializer,
    IncidentFlagSerializer,
)
from .permissions import (
    IsReporterOrReadOnly,
    CanVerifyIncidents,
    CanAssignIncidents,
    CanReviewFlags,
)
import uuid


class IncidentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing incidents.

    Provides endpoints for:
    - Creating incidents
    - Listing incidents
    - Retrieving specific incidents
    - Updating incidents
    - Deleting incidents
    - Adding updates
    - Verifying incidents
    - Assigning incidents
    - Flagging incidents
    """

    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = [
        "incident_type",
        "severity",
        "status",
        "reported_by",
        "assigned_to",
    ]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["created_at", "updated_at", "resolved_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get active incidents."""
        queryset = Incident.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on the action."""
        if self.action == "create":
            return IncidentCreateSerializer
        return IncidentSerializer

    def perform_create(self, serializer):
        """Create a new incident and set the reporter."""
        return serializer.save(reported_by=self.request.user)

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """Update the status of an incident."""
        incident = self.get_object()
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": "status is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # If status is being set to resolved, set resolved_at
        if new_status == "RESOLVED" and incident.status != "RESOLVED":
            incident.resolved_at = timezone.now()

        incident.status = new_status
        incident.save()

        serializer = self.get_serializer(incident)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[CanVerifyIncidents])
    def verify(self, request, pk=None):
        """Verify an incident."""
        incident = self.get_object()

        if incident.verified_by:
            return Response(
                {"error": "Incident is already verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        incident.verified_by = request.user
        incident.status = "VERIFIED"
        incident.save()

        serializer = self.get_serializer(incident)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[CanAssignIncidents])
    def assign(self, request, pk=None):
        """Assign an incident to a user."""
        incident = self.get_object()
        assignee_id = request.data.get("assignee_id")

        if not assignee_id:
            return Response(
                {"error": "assignee_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            assignee = User.objects.get(id=assignee_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid assignee_id"}, status=status.HTTP_400_BAD_REQUEST
            )

        incident.assigned_to = assignee
        if incident.status == "REPORTED":
            incident.status = "IN_PROGRESS"
        incident.save()

        serializer = self.get_serializer(incident)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_update(self, request, pk=None):
        """Add an update to an incident."""
        incident = self.get_object()
        serializer = IncidentUpdateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(incident=incident, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def updates(self, request, pk=None):
        """Get all updates for an incident."""
        incident = self.get_object()
        updates = incident.updates.all()
        serializer = IncidentUpdateSerializer(updates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def flag(self, request, pk=None):
        """Flag an incident."""
        incident = self.get_object()
        serializer = IncidentFlagSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(incident=incident, reported_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def flags(self, request, pk=None):
        """Get all flags for an incident."""
        incident = self.get_object()
        flags = incident.flags.all()
        serializer = IncidentFlagSerializer(flags, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_incidents(self, request):
        """Get all incidents reported by or assigned to the current user."""
        incidents = self.get_queryset().filter(
            Q(reported_by=request.user) | Q(assigned_to=request.user)
        )
        serializer = self.get_serializer(incidents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        """Get incidents near a specific location."""
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radius = request.query_params.get("radius", 10)  # default 10km

        if not lat or not lng:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: Implement geospatial query
        return Response(
            {"error": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff members can resolve incidents"},
                status=status.HTTP_403_FORBIDDEN,
            )

        incident.is_resolved = True
        incident.resolved_by = request.user
        incident.save()

        serializer = self.get_serializer(incident)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new incident."""
        try:
            # Debug print
            print("Received data:", request.data)
            print("Files:", request.FILES)

            # Create incident data
            data = {
                "title": request.data.get("title"),
                "description": request.data.get("description"),
                "incident_type": request.data.get("incident_type"),
                "severity": request.data.get("severity"),
                "location": request.data.get("location"),
                "latitude": request.data.get("latitude"),
                "longitude": request.data.get("longitude"),
            }

            # Handle file attachment if present
            if "attachment" in request.FILES:
                data["attachment"] = request.FILES["attachment"]

            # Use IncidentCreateSerializer for validation and creation
            create_serializer = self.get_serializer(data=data)
            create_serializer.is_valid(raise_exception=True)
            instance = self.perform_create(create_serializer)

            # Use IncidentSerializer for the response
            response_serializer = IncidentSerializer(
                instance, context={"request": request}
            )
            headers = self.get_success_headers(response_serializer.data)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers,
            )

        except Exception as e:
            print("Error:", str(e))  # Debug print
            print("Traceback:", e.__traceback__)  # Debug print
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
