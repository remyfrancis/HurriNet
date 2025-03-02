from django.contrib import admin
from .models import Incident

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ["tracking_id", "incident_type", "status", "created_at"]
    search_fields = ["tracking_id", "description"]
    list_filter = ["incident_type", "status"]
