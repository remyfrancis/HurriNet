"""
URL configuration for the feed app.

This module defines the URL patterns for feed-related endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedPostViewSet

# Create a router and register our viewset with it
router = DefaultRouter()
router.register(r"posts", FeedPostViewSet, basename="feed-post")

# URL patterns for feed endpoints:
# - GET /api/feed/posts/ (list all posts)
# - POST /api/feed/posts/ (create new post)
# - GET /api/feed/posts/{id}/ (get specific post)
# - PUT/PATCH /api/feed/posts/{id}/ (update post)
# - DELETE /api/feed/posts/{id}/ (delete post)
# - POST /api/feed/posts/{id}/comment/ (add comment)
# - POST /api/feed/posts/{id}/react/ (add/toggle reaction)
# - GET /api/feed/posts/{id}/comments/ (get comments)
# - GET /api/feed/posts/{id}/reactions/ (get reactions)
# - GET /api/feed/posts/my-posts/ (get user's posts)
# - GET /api/feed/posts/nearby/ (get nearby posts)
urlpatterns = [
    path("", include(router.urls)),
]
