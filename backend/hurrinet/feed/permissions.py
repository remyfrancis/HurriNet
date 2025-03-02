"""
Custom permissions for the feed functionality in HurriNet.

This module defines custom permissions for feed-related operations.
"""

from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of a post to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the author of the post
        return obj.author == request.user


class CanVerifyPosts(permissions.BasePermission):
    """
    Custom permission to only allow authorized users to verify posts.
    """

    def has_permission(self, request, view):
        # Only allow users with appropriate roles to verify posts
        if not request.user.is_authenticated:
            return False

        # Allow emergency personnel and admins to verify posts
        return request.user.role in ["EMERGENCY_PERSONNEL", "ADMIN"]
