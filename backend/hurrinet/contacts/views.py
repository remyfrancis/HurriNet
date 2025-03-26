from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Contact
from .serializers import ContactSerializer


class IsAdminOrEmergencyHQ(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Allow read access to all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only allow write access to admins and emergency HQ personnel
        return request.user.role.lower() in ["administrator", "emergency personnel"]


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAdminOrEmergencyHQ]

    def get_queryset(self):
        return Contact.objects.all().order_by("organization")
