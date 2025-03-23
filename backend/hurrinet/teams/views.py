from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer, UserSerializer
from .permissions import IsTeamLeaderOrReadOnly

User = get_user_model()


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsTeamLeaderOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["team_type", "status", "is_active"]
    search_fields = ["name", "description", "location"]
    ordering_fields = ["name", "created_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        team_type = self.request.query_params.get("type", None)
        if team_type:
            queryset = queryset.filter(team_type=team_type)
        return queryset

    @action(detail=False, methods=["get"])
    def medical(self, request):
        """Get all medical teams"""
        queryset = self.get_queryset().filter(team_type="MEDICAL")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def emergency(self, request):
        """Get all emergency teams (non-medical)"""
        queryset = self.get_queryset().exclude(team_type="MEDICAL")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def medical_personnel(self, request):
        """Get all medical personnel"""
        users = User.objects.filter(role="MEDICAL_PERSONNEL")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def emergency_personnel(self, request):
        """Get all emergency personnel"""
        users = User.objects.filter(role="EMERGENCY_PERSONNEL")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_member(self, request, pk=None):
        team = self.get_object()
        serializer = TeamMemberSerializer(
            data={
                "team": team.id,
                "user_id": request.data.get("user_id"),
                "role": request.data.get("role", "MEMBER"),
                "status": request.data.get("status", "ACTIVE"),
            }
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get("user_id")
        try:
            member = team.teammember_set.get(user_id=user_id)
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TeamMember.DoesNotExist:
            return Response(
                {"detail": "Member not found in team"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        team = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(Team.TEAM_STATUS):
            return Response(
                {"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )
        team.status = new_status
        team.save()
        return Response(TeamSerializer(team).data)


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["team", "role", "status"]
    search_fields = ["user__first_name", "user__last_name", "specialization"]
    ordering_fields = ["joined_at", "role"]
    ordering = ["team", "role", "joined_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Regular users can only see members of their teams
            queryset = queryset.filter(team__members=self.request.user)
        return queryset

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        member = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(TeamMember.MEMBER_STATUS):
            return Response(
                {"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )
        member.status = new_status
        member.save()
        return Response(TeamMemberSerializer(member).data)

    @action(detail=True, methods=["post"])
    def update_role(self, request, pk=None):
        member = self.get_object()
        new_role = request.data.get("role")
        if new_role not in dict(TeamMember.MEMBER_ROLES):
            return Response(
                {"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST
            )
        member.role = new_role
        member.save()
        return Response(TeamMemberSerializer(member).data)
