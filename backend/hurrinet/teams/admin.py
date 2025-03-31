from django.contrib import admin
from .models import Team, TeamMember


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 1
    fields = ("user", "role", "status", "specialization")
    raw_id_fields = ("user",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "team_type", "status", "leader", "is_active", "created_at")
    list_filter = ("team_type", "status", "is_active")
    search_fields = ("name", "description", "location")
    readonly_fields = ("created_at", "updated_at")
    inlines = [TeamMemberInline]
    fieldsets = (
        (None, {"fields": ("name", "description", "team_type", "specialty", "status")}),
        ("Team Management", {"fields": ("leader", "is_active")}),
        (
            "Assignment Information",
            {"fields": ("current_assignment", "location", "equipment")},
        ),
        ("Additional Information", {"fields": ("notes", "created_at", "updated_at")}),
    )


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "team", "role", "status", "joined_at")
    list_filter = ("team", "role", "status")
    search_fields = ("user__first_name", "user__last_name", "specialization")
    readonly_fields = ("joined_at",)
    raw_id_fields = ("user", "team")
    fieldsets = (
        (None, {"fields": ("team", "user", "role", "status")}),
        ("Professional Information", {"fields": ("specialization", "certifications")}),
        ("Additional Information", {"fields": ("notes", "joined_at")}),
    )
