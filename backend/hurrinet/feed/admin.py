"""
Admin configuration for the feed app.

This module defines the admin interfaces for feed models.
"""

from django.contrib import admin
from .models import FeedPost, PostComment, PostReaction


@admin.register(FeedPost)
class FeedPostAdmin(admin.ModelAdmin):
    """Admin interface for feed posts."""

    list_display = (
        "id",
        "author",
        "post_type",
        "location",
        "created_at",
        "is_active",
        "is_verified",
        "verified_by",
    )
    list_filter = ("post_type", "is_active", "is_verified", "created_at")
    search_fields = ("content", "location", "author__email")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("author", "verified_by")
    date_hierarchy = "created_at"


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    """Admin interface for post comments."""

    list_display = ("id", "post", "author", "created_at", "is_active")
    list_filter = ("is_active", "created_at")
    search_fields = ("content", "author__email")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("post", "author")
    date_hierarchy = "created_at"


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    """Admin interface for post reactions."""

    list_display = ("id", "post", "user", "reaction_type", "created_at")
    list_filter = ("reaction_type", "created_at")
    search_fields = ("user__email",)
    readonly_fields = ("created_at",)
    raw_id_fields = ("post", "user")
    date_hierarchy = "created_at"
