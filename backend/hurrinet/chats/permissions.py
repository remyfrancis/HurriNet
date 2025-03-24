"""
Permissions for the chat functionality in HurriNet.

This module provides custom permission classes to enforce role-based
messaging rules in the chat system.
"""

from rest_framework import permissions


class CanMessageUser(permissions.BasePermission):
    """
    Permission class that enforces role-based messaging rules.

    Rules:
    - Administrators can message anyone
    - Citizens can message other citizens
    - Resource Managers, Emergency Personnel, and Medical Personnel can message each other
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user

        # Administrators can message anyone
        if user.is_staff or user.is_superuser:
            return True

        # For chat session creation, check recipient
        if view.action == "create":
            recipient_id = request.data.get("recipient")
            if not recipient_id:
                return False

            from django.contrib.auth import get_user_model

            User = get_user_model()

            try:
                recipient = User.objects.get(id=recipient_id)
            except User.DoesNotExist:
                return False

            # Citizens can message other citizens
            if user.role == "CITIZEN" and recipient.role == "CITIZEN":
                return True

            # Professional roles can message each other
            professional_roles = [
                "RESOURCE_MANAGER",
                "EMERGENCY_PERSONNEL",
                "MEDICAL_PERSONNEL",
            ]
            if user.role in professional_roles and recipient.role in professional_roles:
                return True

            return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Administrators can access any chat
        if user.is_staff or user.is_superuser:
            return True

        # Check if user is a participant
        if not obj.can_participate(user):
            return False

        # For existing chats, verify role-based rules
        other_user = obj.recipient if obj.initiator == user else obj.initiator

        # Citizens can only chat with other citizens
        if user.role == "CITIZEN":
            return other_user.role == "CITIZEN"

        # Professional roles can chat with each other
        professional_roles = [
            "RESOURCE_MANAGER",
            "EMERGENCY_PERSONNEL",
            "MEDICAL_PERSONNEL",
        ]
        if user.role in professional_roles:
            return other_user.role in professional_roles

        return False
