from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Alert
from .serializers import AlertSerializer


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Alert.objects.all()

        # Filter by active status
        active = self.request.query_params.get("active", None)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == "true")

        # Filter by district
        district = self.request.query_params.get("district", None)
        if district:
            queryset = queryset.filter(district=district)

        return queryset

    def perform_create(self, serializer):
        """Set the creator when creating a new alert."""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get all currently active alerts."""
        active_alerts = Alert.objects.filter(active=True).order_by("-created_at")
        serializer = self.get_serializer(active_alerts, many=True)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
