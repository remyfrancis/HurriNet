"""
Custom permissions for incident reporting in HurriNet.

This module defines custom permissions for incident-related operations.
"""

from rest_framework import permissions


class IsReporterOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow reporters of an incident to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the reporter of the incident
        return obj.created_by == request.user


class CanVerifyIncidents(permissions.BasePermission):
    """
    Custom permission to only allow authorized users to verify incidents.
    """

    def has_permission(self, request, view):
        # Only allow users with appropriate roles to verify incidents
        if not request.user.is_authenticated:
            return False

        # Allow emergency personnel and admins to verify incidents
        return request.user.role in ["EMERGENCY_PERSONNEL", "ADMIN"]


class CanAssignIncidents(permissions.BasePermission):
    """
    Custom permission to only allow authorized users to assign incidents.
    """

    def has_permission(self, request, view):
        # Only allow users with appropriate roles to assign incidents
        if not request.user.is_authenticated:
            return False

        # Allow emergency personnel and admins to assign incidents
        return request.user.role in ["EMERGENCY_PERSONNEL", "ADMIN"]


class CanReviewFlags(permissions.BasePermission):
    """
    Custom permission to only allow authorized users to review incident flags.
    """

    def has_permission(self, request, view):
        # Only allow users with appropriate roles to review flags
        if not request.user.is_authenticated:
            return False

        # Allow emergency personnel and admins to review flags
        return request.user.role in ["EMERGENCY_PERSONNEL", "ADMIN"]
