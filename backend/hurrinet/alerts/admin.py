from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'severity', 'district', 'active', 'created_at']
    list_filter = ['severity', 'active', 'type', 'district']
    search_fields = ['title', 'type', 'district']
