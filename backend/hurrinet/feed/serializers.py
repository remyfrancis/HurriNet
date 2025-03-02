"""
Serializers for the feed functionality in HurriNet.

This module provides serializers for converting feed models to/from JSON.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FeedPost, PostComment, PostReaction

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):
    """Brief serializer for user information in feed contexts."""

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role")
        read_only_fields = fields


class PostReactionSerializer(serializers.ModelSerializer):
    """Serializer for post reactions."""

    user = UserBriefSerializer(read_only=True)
    reaction_type_display = serializers.CharField(
        source="get_reaction_type_display", read_only=True
    )

    class Meta:
        model = PostReaction
        fields = (
            "id",
            "post",
            "user",
            "reaction_type",
            "reaction_type_display",
            "created_at",
        )
        read_only_fields = ("post", "user")


class PostCommentSerializer(serializers.ModelSerializer):
    """Serializer for post comments."""

    author = UserBriefSerializer(read_only=True)

    class Meta:
        model = PostComment
        fields = (
            "id",
            "post",
            "author",
            "content",
            "created_at",
            "updated_at",
            "is_active",
        )
        read_only_fields = ("post", "author", "is_active")


class FeedPostSerializer(serializers.ModelSerializer):
    """Serializer for feed posts with detailed information."""

    author = UserBriefSerializer(read_only=True)
    verified_by = UserBriefSerializer(read_only=True)
    post_type_display = serializers.CharField(
        source="get_post_type_display", read_only=True
    )
    comment_count = serializers.IntegerField(read_only=True)
    reaction_count = serializers.IntegerField(read_only=True)
    comments = PostCommentSerializer(many=True, read_only=True)
    reactions = PostReactionSerializer(many=True, read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = FeedPost
        fields = (
            "id",
            "author",
            "content",
            "post_type",
            "post_type_display",
            "location",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
            "is_active",
            "is_verified",
            "verified_by",
            "attachment",
            "attachment_url",
            "comment_count",
            "reaction_count",
            "comments",
            "reactions",
        )
        read_only_fields = (
            "author",
            "is_active",
            "is_verified",
            "verified_by",
        )

    def get_attachment_url(self, obj):
        """Get the full URL for the attachment if it exists."""
        if obj.attachment:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None


class FeedPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating feed posts."""

    class Meta:
        model = FeedPost
        fields = (
            "content",
            "post_type",
            "location",
            "latitude",
            "longitude",
            "attachment",
        )
