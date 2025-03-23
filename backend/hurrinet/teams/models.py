from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class Team(models.Model):
    TEAM_TYPES = [
        ("MEDICAL", "Medical Response"),
        ("FIRST_RESPONSE", "First Response"),
        ("SEARCH_RESCUE", "Search and Rescue"),
        ("EVACUATION", "Evacuation"),
        ("HAZMAT", "Hazardous Materials"),
        ("LOGISTICS", "Logistics Support"),
    ]

    MEDICAL_SPECIALTIES = [
        ("EMERGENCY", "Emergency Medicine"),
        ("TRAUMA", "Trauma Care"),
        ("GENERAL", "General Medical"),
        ("SPECIALIZED", "Specialized Care"),
    ]

    MEDICAL_STATUS = [
        ("ACTIVE", "Active"),
        ("ON_CALL", "On Call"),
        ("OFF_DUTY", "Off Duty"),
    ]

    EMERGENCY_STATUS = [
        ("DEPLOYED", "Deployed"),
        ("STANDBY", "Standby"),
        ("OFF_DUTY", "Off Duty"),
    ]

    name = models.CharField(_("Team Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True)
    team_type = models.CharField(_("Team Type"), max_length=50, choices=TEAM_TYPES)
    specialty = models.CharField(
        _("Specialty"),
        max_length=50,
        choices=MEDICAL_SPECIALTIES,
        blank=True,
        null=True,
        help_text=_("Specialty for medical teams"),
    )
    status = models.CharField(
        _("Status"),
        max_length=20,
        help_text=_("Status choices depend on team type (medical or emergency)"),
    )
    leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="led_teams",
        verbose_name=_("Team Leader"),
    )
    members = models.ManyToManyField(
        User, through="TeamMember", related_name="teams", verbose_name=_("Team Members")
    )
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)
    is_active = models.BooleanField(_("Active"), default=True)
    current_assignment = models.CharField(
        _("Current Assignment"), max_length=255, blank=True, null=True
    )
    equipment = models.JSONField(_("Equipment"), default=list, blank=True)
    location = models.CharField(_("Location"), max_length=255, blank=True, null=True)
    notes = models.TextField(_("Notes"), blank=True)

    class Meta:
        app_label = "teams"
        verbose_name = _("Team")
        verbose_name_plural = _("Teams")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_team_type_display()})"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Validate status based on team type
        if self.team_type == "MEDICAL":
            if self.status not in [status[0] for status in self.MEDICAL_STATUS]:
                raise ValidationError(
                    {
                        "status": _(
                            "Invalid status for medical team. Must be one of: ACTIVE, ON_CALL, OFF_DUTY"
                        )
                    }
                )
        else:
            if self.status not in [status[0] for status in self.EMERGENCY_STATUS]:
                raise ValidationError(
                    {
                        "status": _(
                            "Invalid status for emergency team. Must be one of: DEPLOYED, STANDBY, OFF_DUTY"
                        )
                    }
                )

        # Validate specialty for medical teams
        if self.team_type == "MEDICAL" and not self.specialty:
            raise ValidationError(
                {"specialty": _("Medical teams must have a specialty")}
            )
        elif self.team_type != "MEDICAL" and self.specialty:
            raise ValidationError(
                {"specialty": _("Only medical teams can have a specialty")}
            )

    def get_active_members_count(self):
        return self.teammember_set.filter(status="ACTIVE").count()

    def get_available_members_count(self):
        return self.teammember_set.exclude(status="OFF_DUTY").count()


class TeamMember(models.Model):
    MEMBER_STATUS = [
        ("ACTIVE", "Active"),
        ("ON_CALL", "On Call"),
        ("OFF_DUTY", "Off Duty"),
        ("ON_LEAVE", "On Leave"),
    ]

    MEMBER_ROLES = [
        ("LEADER", "Team Leader"),
        ("DEPUTY", "Deputy Leader"),
        ("SPECIALIST", "Specialist"),
        ("MEMBER", "Team Member"),
        ("TRAINEE", "Trainee"),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, verbose_name=_("Team"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    role = models.CharField(
        _("Role"), max_length=20, choices=MEMBER_ROLES, default="MEMBER"
    )
    status = models.CharField(
        _("Status"), max_length=20, choices=MEMBER_STATUS, default="ACTIVE"
    )
    joined_at = models.DateTimeField(_("Joined At"), auto_now_add=True)
    specialization = models.CharField(_("Specialization"), max_length=100, blank=True)
    certifications = models.JSONField(_("Certifications"), default=list, blank=True)
    notes = models.TextField(_("Notes"), blank=True)

    class Meta:
        app_label = "teams"
        verbose_name = _("Team Member")
        verbose_name_plural = _("Team Members")
        unique_together = ["team", "user"]
        ordering = ["team", "role", "joined_at"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.team.name} ({self.get_role_display()})"
