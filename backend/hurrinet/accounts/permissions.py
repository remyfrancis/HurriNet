"""
Custom permission classes for the HurriNet application to handle user authorization.
These classes extend Django REST Framework's base permissions to implement role-based access control.
"""

from rest_framework import permissions


class IsEmergencyPersonnel(permissions.BasePermission):
    """
    Permission class to restrict access to emergency personnel only.

    This permission will be used to protect views that should only be accessible
    to authenticated users who are designated as emergency personnel.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated and has emergency personnel status
        return request.user.is_authenticated and request.user.is_emergency_personnel()


class IsCommunityMember(permissions.BasePermission):
    """
    Permission class to restrict access to community members only.

    This permission will be used to protect views that should only be accessible
    to authenticated users who are registered as community members.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated and has community member status
        return request.user.is_authenticated and request.user.user_type == "community"
