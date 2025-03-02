from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Incident
from .serializers import IncidentSerializer
import uuid


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    parser_classes = (MultiPartParser, FormParser)
    lookup_field = "tracking_id"  # Add this line to use tracking_id instead of id

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
                latitude = float(location[0].strip())  # Added strip() to remove whitespace
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
                {
                    "success": True,
                    "tracking_id": tracking_id,
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            import traceback
            print("Error:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
