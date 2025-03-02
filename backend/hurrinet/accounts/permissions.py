from rest_framework import permissions


class IsEmergencyPersonnel(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_emergency_personnel()


class IsCommunityMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == "community"
