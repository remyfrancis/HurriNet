"""
Models for the feed functionality in HurriNet.

This module defines models for managing feed posts and interactions.
"""

from django.db import models
from django.conf import settings


class FeedPost(models.Model):
    """Model for feed posts."""

    POST_TYPES = [
        ("UPDATE", "Status Update"),
        ("HELP_REQUEST", "Help Request"),
        ("OFFER_HELP", "Offer Help"),
        ("INFO", "Information"),
        ("WARNING", "Warning"),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feed_posts"
    )
    content = models.TextField()
    post_type = models.CharField(max_length=20, choices=POST_TYPES)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_posts",
    )
    attachment = models.FileField(
        upload_to="feed_attachments/%Y/%m/%d/", null=True, blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_post_type_display()} by {self.author.email}"


class PostComment(models.Model):
    """Model for comments on feed posts."""

    post = models.ForeignKey(
        FeedPost, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feed_comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author.email} on {self.post}"


class PostReaction(models.Model):
    """Model for reactions to feed posts."""

    REACTION_TYPES = [
        ("LIKE", "Like"),
        ("HELPFUL", "Helpful"),
        ("IMPORTANT", "Important"),
        ("FLAG", "Flag"),
    ]

    post = models.ForeignKey(
        FeedPost, on_delete=models.CASCADE, related_name="reactions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="feed_reactions",
    )
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["post", "user", "reaction_type"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reaction_type} by {self.user.email} on {self.post}"
