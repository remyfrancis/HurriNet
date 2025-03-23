from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Team, TeamMember

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "role"]

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email


class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "team",
            "user",
            "user_id",
            "role",
            "role_display",
            "status",
            "status_display",
            "joined_at",
            "specialization",
            "certifications",
            "notes",
        ]
        read_only_fields = ["joined_at"]


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(source="teammember_set", many=True, read_only=True)
    leader = UserSerializer(read_only=True)
    leader_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="leader",
        write_only=True,
        required=False,
        allow_null=True,
    )
    team_type_display = serializers.CharField(
        source="get_team_type_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    active_members_count = serializers.IntegerField(
        source="get_active_members_count", read_only=True
    )
    available_members_count = serializers.IntegerField(
        source="get_available_members_count", read_only=True
    )

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "description",
            "team_type",
            "team_type_display",
            "status",
            "status_display",
            "leader",
            "leader_id",
            "members",
            "created_at",
            "updated_at",
            "is_active",
            "current_assignment",
            "equipment",
            "location",
            "notes",
            "active_members_count",
            "available_members_count",
        ]
        read_only_fields = ["created_at", "updated_at"]
