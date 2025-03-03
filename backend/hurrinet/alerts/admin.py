from django.contrib import admin
from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "severity",
        "district",
        "created_by",
        "is_active",
        "is_public",
        "created_at",
    ]
    list_filter = ["severity", "district", "is_active", "is_public", "created_at"]
    search_fields = ["title", "description", "affected_areas"]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["created_by"]
