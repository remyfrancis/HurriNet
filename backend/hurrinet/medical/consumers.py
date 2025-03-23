from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .models import FacilityStatusReport, MedicalFacility


class MedicalDashboardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Add the channel to the medical-dashboard group
        await self.channel_layer.group_add("medical_dashboard", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the channel from the medical-dashboard group
        await self.channel_layer.group_discard("medical_dashboard", self.channel_name)

    async def receive_json(self, content):
        """Handle incoming WebSocket messages"""
        message_type = content.get("type")
        if message_type == "get_dashboard_data":
            await self.send_dashboard_data()

    async def send_dashboard_data(self):
        """Send dashboard data to the client"""
        data = await self.get_dashboard_data()
        await self.send_json({"type": "dashboard_data", "data": data})

    @database_sync_to_async
    def get_dashboard_data(self):
        """Get the dashboard data from the database"""
        facilities = MedicalFacility.objects.all()
        active_reports = FacilityStatusReport.objects.filter(acknowledged=False)

        return {
            "total_facilities": facilities.count(),
            "active_reports": active_reports.count(),
            "facilities_status": {
                "operational": facilities.filter(status="OPERATIONAL").count(),
                "limited": facilities.filter(status="LIMITED").count(),
                "critical": facilities.filter(status="CRITICAL").count(),
                "offline": facilities.filter(status="OFFLINE").count(),
            },
        }

    async def facility_update(self, event):
        """Handle facility updates"""
        await self.send_json({"type": "facility_update", "data": event["data"]})

    async def report_update(self, event):
        """Handle report updates"""
        await self.send_json({"type": "report_update", "data": event["data"]})
