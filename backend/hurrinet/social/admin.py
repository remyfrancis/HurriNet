from django.contrib import admin
from .models import Post, Comment, Reaction


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "content",
        "author",
        "post_type",
        "created_at",
        "is_active",
        "is_public",
        "is_verified",
    )
    list_filter = ("post_type", "is_active", "is_public", "is_verified", "created_at")
    search_fields = ("content", "author__email", "location")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("author", "verified_by")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "content", "author", "post", "created_at", "is_active")
    list_filter = ("is_active", "created_at")
    search_fields = ("content", "author__email")
    raw_id_fields = ("author", "post")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)


@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "reaction_type", "created_at")
    list_filter = ("reaction_type", "created_at")
    search_fields = ("user__email", "post__content")
    raw_id_fields = ("user", "post")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
