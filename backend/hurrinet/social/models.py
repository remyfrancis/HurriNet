from django.db import models
from django.conf import settings
from django.utils import timezone


class Post(models.Model):
    """Model for social feed posts with comprehensive features."""

    POST_TYPES = [
        ("UPDATE", "Status Update"),
        ("HELP_REQUEST", "Help Request"),
        ("OFFER_HELP", "Offer Help"),
        ("INFO", "Information"),
        ("WARNING", "Warning"),
        ("GENERAL", "General Post"),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts"
    )
    content = models.TextField()
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default="GENERAL")
    image = models.ImageField(upload_to="social/posts/", null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="social_verified_posts",
    )
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="liked_posts", blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.pk is None:  # Only set defaults for new instances
            self.is_active = True if self.is_active is None else self.is_active
            self.is_public = True if self.is_public is None else self.is_public
            self.post_type = self.post_type or "GENERAL"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_post_type_display()} by {self.author.email}"

    def like_count(self):
        return self.likes.count()

    def has_user_liked(self, user):
        return self.likes.filter(id=user.id).exists()


class Comment(models.Model):
    """Model for comments on posts."""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author.email} on {self.post}"


class Reaction(models.Model):
    """Model for reactions to posts."""

    REACTION_TYPES = [
        ("LIKE", "Like"),
        ("HELPFUL", "Helpful"),
        ("IMPORTANT", "Important"),
        ("FLAG", "Flag"),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_reactions",
    )
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["post", "user", "reaction_type"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reaction_type} by {self.user.email} on {self.post}"
