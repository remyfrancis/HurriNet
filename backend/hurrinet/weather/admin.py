from django.contrib import admin
from .models import WeatherData, WeatherForecast, WeatherAlert


@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = [
        "location",
        "temperature",
        "conditions",
        "humidity",
        "wind_speed",
        "timestamp",
    ]
    list_filter = ["location", "conditions", "timestamp"]
    search_fields = ["location"]
    readonly_fields = ["timestamp"]
    ordering = ["-timestamp"]


@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = [
        "location",
        "date",
        "high_temp",
        "low_temp",
        "conditions",
        "precipitation_chance",
    ]
    list_filter = ["location", "date", "conditions"]
    search_fields = ["location"]
    date_hierarchy = "date"
    ordering = ["date"]


@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "alert_type",
        "severity",
        "area_affected",
        "start_time",
        "end_time",
        "is_active",
    ]
    list_filter = ["alert_type", "severity", "is_active", "start_time", "end_time"]
    search_fields = ["title", "description", "area_affected"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]
    list_editable = ["is_active"]
    fieldsets = (
        (
            "Alert Information",
            {"fields": ("title", "alert_type", "severity", "description")},
        ),
        ("Location & Timing", {"fields": ("area_affected", "start_time", "end_time")}),
        ("Status", {"fields": ("is_active", "created_at", "updated_at")}),
    )
