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
from django.contrib.gis.geos import Point
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
from django.shortcuts import render
from django.conf import settings
from utils.cache import (
    get_cache_key,
    get_cached_data,
    set_cached_data,
    delete_cached_data,
    cache_response,
    clear_pattern,
)
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache


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
    parser_classes = [MultiPartParser, FormParser]
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
        """Get cached queryset if available."""
        cache_key = get_cache_key("incidents", "list")
        cached_data = get_cached_data(cache_key)

        if cached_data is not None:
            return cached_data

        queryset = super().get_queryset()
        set_cached_data(cache_key, queryset, settings.INCIDENT_CACHE_TTL)
        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on the action."""
        if self.action == "create":
            return IncidentCreateSerializer
        return IncidentSerializer

    def perform_create(self, serializer):
        """Create a new incident."""
        return serializer.save()

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
        """Resolve incident and invalidate cache."""
        incident = self.get_object()
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff members can resolve incidents"},
                status=status.HTTP_403_FORBIDDEN,
            )

        incident.is_resolved = True
        incident.resolved_by = request.user
        incident.save()

        # Invalidate caches
        delete_cached_data(get_cache_key("incidents", f"detail:{pk}"))
        clear_pattern("incidents:list")

        serializer = self.get_serializer(incident)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def check_updates(self, request):
        """Check for incident updates since a given timestamp."""
        timestamp = request.query_params.get("since")
        if not timestamp:
            return Response(
                {"error": "Missing 'since' parameter"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Query only incidents updated after the given timestamp
            updated_incidents = Incident.objects.filter(
                updated_at__gt=timestamp
            ).order_by("-updated_at")

            serializer = self.get_serializer(updated_incidents, many=True)
            return Response(
                {"updates": serializer.data, "timestamp": timezone.now().isoformat()}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        """Create a new incident and invalidate cache."""
        # Log authentication status
        print(f"User authentication status: {request.user.is_authenticated}")
        if request.user.is_authenticated:
            print(f"Authenticated user: {request.user.email} (ID: {request.user.id})")
        else:
            print("Warning: User is not authenticated!")

        # Log request information
        print(f"Request content type: {request.content_type}")
        print(f"Request headers: {dict(request.headers)}")
        print(
            f"Request data keys: {request.data.keys() if hasattr(request.data, 'keys') else 'No keys available'}"
        )

        # Handle multipart form data with photo
        if request.content_type and request.content_type.startswith(
            "multipart/form-data"
        ):
            try:
                # If 'data' field exists, it contains the GeoJSON data
                if "data" in request.data:
                    import json

                    # Parse the GeoJSON data
                    geojson_data = json.loads(request.data["data"])

                    # Extract properties and geometry
                    properties = geojson_data.get("properties", {})
                    geometry = geojson_data.get("geometry", {})

                    # Create a new data dict with the properties
                    data = {
                        "title": properties.get("title"),
                        "description": properties.get("description"),
                        "incident_type": properties.get("incident_type"),
                        "severity": properties.get("severity"),
                    }

                    # Add the photo if it exists
                    if "photo" in request.FILES:
                        data["photo"] = request.FILES["photo"]

                    # Create a Point object from the coordinates
                    if geometry and geometry.get("type") == "Point":
                        coords = geometry.get("coordinates", [])
                        if len(coords) == 2:
                            # Create a Point object instead of a GeoJSON dict
                            data["location"] = Point(coords[0], coords[1], srid=4326)

                    # Update the request data
                    request._full_data = data
            except Exception as e:
                return Response(
                    {"detail": f"Error processing multipart data: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        response = super().create(request, *args, **kwargs)
        clear_pattern("incidents:*")
        return response

    def update(self, request, *args, **kwargs):
        """Update incident and invalidate cache."""
        response = super().update(request, *args, **kwargs)
        incident_id = kwargs.get("pk")
        delete_cached_data(get_cache_key("incidents", f"detail:{incident_id}"))
        clear_pattern("incidents:list")
        return response

    def destroy(self, request, *args, **kwargs):
        """Delete incident and invalidate cache."""
        incident_id = kwargs.get("pk")
        response = super().destroy(request, *args, **kwargs)
        delete_cached_data(get_cache_key("incidents", f"detail:{incident_id}"))
        clear_pattern("incidents:list")
        return response

    @method_decorator(cache_page(timeout=300))  # 5 minutes cache
    def retrieve(self, request, *args, **kwargs):
        """Get cached incident detail."""
        return super().retrieve(request, *args, **kwargs)


class IncidentUpdateViewSet(viewsets.ModelViewSet):
    queryset = IncidentUpdate.objects.all()
    serializer_class = IncidentUpdateSerializer

    def create(self, request, *args, **kwargs):
        """Create update and invalidate incident cache."""
        response = super().create(request, *args, **kwargs)
        incident_id = response.data.get("incident")
        delete_cached_data(get_cache_key("incidents", f"detail:{incident_id}"))
        return response

    def update(self, request, *args, **kwargs):
        """Update incident update and invalidate cache."""
        response = super().update(request, *args, **kwargs)
        incident_id = response.data.get("incident")
        delete_cached_data(get_cache_key("incidents", f"detail:{incident_id}"))
        return response

    def destroy(self, request, *args, **kwargs):
        """Delete incident update and invalidate cache."""
        update = self.get_object()
        incident_id = update.incident.id
        response = super().destroy(request, *args, **kwargs)
        delete_cached_data(get_cache_key("incidents", f"detail:{incident_id}"))
        return response
