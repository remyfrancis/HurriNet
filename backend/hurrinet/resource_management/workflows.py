from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from .models import Resource, ResourceRequest
from incidents.models import Incident


class BaseEmergencyWorkflow:
    """Base class for emergency workflows"""

    async def find_nearest_facility(self, location: Point, resource_type: str):
        """Find the nearest available facility of specified type"""
        resources = await sync_to_async(list)(
            Resource.objects.filter(resource_type=resource_type, status="AVAILABLE")
            .annotate(distance=Distance("location", location))
            .order_by("distance")
        )
        return resources[0] if resources else None

    async def notify_team(self, team_id: int, message: dict):
        """Send notification to specific team"""
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"team_{team_id}", {"type": "team.notification", "message": message}
        )


class MedicalEmergencyWorkflow(BaseEmergencyWorkflow):
    """Workflow for handling medical emergencies"""

    async def process(self, incident: Incident):
        # Find nearest medical facility
        facility = await self.find_nearest_facility(incident.location, "MEDICAL")
        if facility:
            # Create resource request
            request = await sync_to_async(ResourceRequest.objects.create)(
                resource=facility,
                location=incident.location,
                priority=2 if incident.severity in ["HIGH", "EXTREME"] else 1,
                status="pending",
            )

            # Notify facility
            await self.notify_team(
                facility.id,
                {
                    "incident_id": incident.id,
                    "request_id": request.id,
                    "type": "MEDICAL",
                    "severity": incident.severity,
                    "location": {
                        "lat": incident.location.y,
                        "lng": incident.location.x,
                    },
                },
            )
            return request
        return None


class InfrastructureWorkflow(BaseEmergencyWorkflow):
    """Workflow for handling infrastructure incidents"""

    async def process(self, incident: Incident):
        # Find nearest supplies resource
        resource = await self.find_nearest_facility(incident.location, "SUPPLIES")
        if resource:
            # Create resource request
            request = await sync_to_async(ResourceRequest.objects.create)(
                resource=resource,
                location=incident.location,
                priority=2 if incident.severity in ["HIGH", "EXTREME"] else 1,
                status="pending",
            )

            # Notify public works team
            await self.notify_team(
                resource.id,
                {
                    "incident_id": incident.id,
                    "request_id": request.id,
                    "type": "INFRASTRUCTURE",
                    "severity": incident.severity,
                    "location": {
                        "lat": incident.location.y,
                        "lng": incident.location.x,
                    },
                },
            )
            return request
        return None


class WeatherIncidentWorkflow(BaseEmergencyWorkflow):
    """Workflow for handling weather-related incidents"""

    async def process(self, incident: Incident):
        # Find nearest shelter
        shelter = await self.find_nearest_facility(incident.location, "SHELTER")
        if shelter:
            # Create resource request
            request = await sync_to_async(ResourceRequest.objects.create)(
                resource=shelter,
                location=incident.location,
                priority=2 if incident.severity in ["HIGH", "EXTREME"] else 1,
                status="pending",
            )

            # Notify shelter team
            await self.notify_team(
                shelter.id,
                {
                    "incident_id": incident.id,
                    "request_id": request.id,
                    "type": "WEATHER",
                    "severity": incident.severity,
                    "location": {
                        "lat": incident.location.y,
                        "lng": incident.location.x,
                    },
                },
            )
            return request
        return None


class WorkflowRouter:
    """Routes incidents to appropriate workflows based on type"""

    def __init__(self):
        self.workflows = {
            "MEDICAL": MedicalEmergencyWorkflow(),
            "INFRASTRUCTURE": InfrastructureWorkflow(),
            "WEATHER": WeatherIncidentWorkflow(),
        }

    async def route_incident(self, incident: Incident):
        """Route incident to appropriate workflow"""
        workflow = self.workflows.get(incident.incident_type)
        if workflow:
            return await workflow.process(incident)
        return None
