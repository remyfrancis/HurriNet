from rest_framework import permissions


class IsTeamLeaderOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow team leaders to edit their teams.
    """

    def has_permission(self, request, view):
        # Allow read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed for authenticated users
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the team leader
        # or staff members
        return (
            obj.leader == request.user
            or request.user.is_staff
            or request.user.role in ["ADMINISTRATOR", "EMERGENCY_PERSONNEL"]
        )
