from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    MedicalFacility,
    MedicalSupply,
    MedicalEmergency,
    FacilityStatusReport,
)
from .serializers import (
    MedicalFacilitySerializer,
    MedicalSupplySerializer,
    MedicalEmergencySerializer,
    MedicalEmergencyCreateSerializer,
    FacilityStatusReportSerializer,
)

# Create your views here.


class MedicalFacilityViewSet(viewsets.ModelViewSet):
    queryset = MedicalFacility.objects.all()
    serializer_class = MedicalFacilitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["status", "facility_type"]
    search_fields = ["name", "address"]

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        facility = self.get_object()
        new_status = request.data.get("status")

        if new_status not in dict(MedicalFacility.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )

        facility.status = new_status
        facility.save()
        return Response(self.get_serializer(facility).data)

    @action(detail=True, methods=["post"])
    def update_occupancy(self, request, pk=None):
        facility = self.get_object()
        new_occupancy = request.data.get("current_occupancy")

        try:
            new_occupancy = int(new_occupancy)
            if new_occupancy < 0 or new_occupancy > facility.total_capacity:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid occupancy value"}, status=status.HTTP_400_BAD_REQUEST
            )

        facility.current_occupancy = new_occupancy
        facility.save()
        return Response(self.get_serializer(facility).data)


class MedicalSupplyViewSet(viewsets.ModelViewSet):
    queryset = MedicalSupply.objects.all()
    serializer_class = MedicalSupplySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["facility", "supply_type"]
    search_fields = ["name"]

    @action(detail=True, methods=["post"])
    def update_quantity(self, request, pk=None):
        supply = self.get_object()
        new_quantity = request.data.get("quantity")

        try:
            new_quantity = int(new_quantity)
            if new_quantity < 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid quantity value"}, status=status.HTTP_400_BAD_REQUEST
            )

        supply.quantity = new_quantity
        supply.save()
        return Response(self.get_serializer(supply).data)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get("critical_only"):
            return queryset.filter(quantity__lte=models.F("threshold_level"))
        return queryset


class MedicalEmergencyViewSet(viewsets.ModelViewSet):
    queryset = MedicalEmergency.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["status", "severity", "assigned_facility"]
    search_fields = ["incident_id", "description"]

    def get_serializer_class(self):
        if self.action == "create":
            return MedicalEmergencyCreateSerializer
        return MedicalEmergencySerializer

    @action(detail=True, methods=["post"])
    def assign_facility(self, request, pk=None):
        emergency = self.get_object()
        facility_id = request.data.get("facility_id")

        try:
            facility = MedicalFacility.objects.get(id=facility_id)
        except MedicalFacility.DoesNotExist:
            return Response(
                {"error": "Facility not found"}, status=status.HTTP_404_NOT_FOUND
            )

        emergency.assigned_facility = facility
        emergency.assignment_time = timezone.now()
        emergency.status = "ASSIGNED"
        emergency.save()
        return Response(self.get_serializer(emergency).data)

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        emergency = self.get_object()
        new_status = request.data.get("status")
        resolution_notes = request.data.get("resolution_notes")

        if new_status not in dict(MedicalEmergency.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )

        emergency.status = new_status
        if new_status in ["RESOLVED", "CLOSED"]:
            emergency.resolved_time = timezone.now()
            if resolution_notes:
                emergency.resolution_notes = resolution_notes

        emergency.save()
        return Response(self.get_serializer(emergency).data)


class FacilityStatusReportViewSet(viewsets.ModelViewSet):
    queryset = FacilityStatusReport.objects.all()
    serializer_class = FacilityStatusReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["priority", "acknowledged"]
    search_fields = ["title", "description"]
    basename = "facility-status-report"

    def get_queryset(self):
        user = self.request.user
        if user.role == "MEDICAL_PERSONNEL":
            # Medical personnel can only see their own reports
            return self.queryset.filter(reporter=user)
        elif user.role == "EMERGENCY_PERSONNEL":
            # Emergency personnel can see all reports
            return self.queryset
        return self.queryset.none()

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        report = self.get_object()
        if report.acknowledged:
            return Response(
                {"error": "Report already acknowledged"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.acknowledged = True
        report.acknowledged_by = request.user
        report.acknowledged_at = timezone.now()
        report.save()
        return Response(self.get_serializer(report).data)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
