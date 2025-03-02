"""
Views for the feed functionality in HurriNet.

This module provides views for managing feed posts, comments,
and reactions.
"""

from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .models import FeedPost, PostComment, PostReaction
from .serializers import (
    FeedPostSerializer,
    FeedPostCreateSerializer,
    PostCommentSerializer,
    PostReactionSerializer,
)
from .permissions import IsAuthorOrReadOnly


class FeedPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing feed posts.

    Provides endpoints for:
    - Creating posts
    - Listing posts
    - Retrieving specific posts
    - Updating posts
    - Deleting posts
    - Adding comments
    - Adding reactions
    """

    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    filterset_fields = ["post_type", "author", "is_verified"]
    search_fields = ["content", "location"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get active feed posts."""
        return FeedPost.objects.filter(is_active=True).annotate(
            comment_count=Count("comments", filter=Q(comments__is_active=True)),
            reaction_count=Count("reactions"),
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on the action."""
        if self.action == "create":
            return FeedPostCreateSerializer
        return FeedPostSerializer

    def perform_create(self, serializer):
        """Create a new post and set the author."""
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        """Add a comment to a post."""
        post = self.get_object()
        serializer = PostCommentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(post=post, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def react(self, request, pk=None):
        """Add a reaction to a post."""
        post = self.get_object()
        reaction_type = request.data.get("reaction_type")

        if not reaction_type:
            return Response(
                {"error": "reaction_type is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reaction, created = PostReaction.objects.get_or_create(
            post=post, user=request.user, reaction_type=reaction_type
        )

        if not created:
            # If reaction already exists, remove it (toggle)
            reaction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = PostReactionSerializer(reaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        """Get all comments for a post."""
        post = self.get_object()
        comments = post.comments.filter(is_active=True)
        serializer = PostCommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def reactions(self, request, pk=None):
        """Get all reactions for a post."""
        post = self.get_object()
        reactions = post.reactions.all()
        serializer = PostReactionSerializer(reactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_posts(self, request):
        """Get all posts by the current user."""
        posts = self.get_queryset().filter(author=request.user)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        """Get posts near a specific location."""
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radius = request.query_params.get("radius", 10)  # default 10km

        if not lat or not lng:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: Implement geospatial query
        return Response(
            {"error": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED
        )
