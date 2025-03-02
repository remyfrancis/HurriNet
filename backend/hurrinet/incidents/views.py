"""
Views for incident reporting in HurriNet.

This module provides views for managing incidents, updates, and flags.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
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

    permission_classes = [IsAuthenticated, IsReporterOrReadOnly]
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
        return Incident.objects.filter(is_active=True)

    def get_serializer_class(self):
        """Return appropriate serializer based on the action."""
        if self.action == "create":
            return IncidentCreateSerializer
        return IncidentSerializer

    def perform_create(self, serializer):
        """Create a new incident and set the reporter."""
        serializer.save(reported_by=self.request.user)

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

    def create(self, request, *args, **kwargs):
        try:
            # Debug print
            print("Received data:", request.data)
            print("Files:", request.FILES)

            # Generate unique tracking ID
            while True:
                tracking_id = str(uuid.uuid4())[:8]
                if not Incident.objects.filter(tracking_id=tracking_id).exists():
                    break

            # Extract coordinates from location string
            location = request.data.get("location", "")
            print("Location:", location)  # Debug print

            if not location:
                return Response(
                    {"error": "Location is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            location = location.split(",")
            if len(location) != 2:
                return Response(
                    {"error": f"Invalid location format: {location}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                latitude = float(
                    location[0].strip()
                )  # Added strip() to remove whitespace
                longitude = float(location[1].strip())
            except ValueError as e:
                return Response(
                    {"error": f"Invalid coordinates: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create incident data
            data = {
                "tracking_id": tracking_id,
                "incident_type": request.data.get("incidentType"),
                "description": request.data.get("description"),
                "latitude": latitude,
                "longitude": longitude,
                "status": "pending",
            }

            print("Processed data:", data)  # Debug print

            # Handle photo if present
            if "photo" in request.FILES:
                data["photo"] = request.FILES["photo"]

            # Create the incident directly
            incident = Incident.objects.create(**data)

            # Serialize the created incident
            serializer = self.get_serializer(incident)

            return Response(
                {"success": True, "tracking_id": tracking_id, "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            import traceback

            print("Error:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
