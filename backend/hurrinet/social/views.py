from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count, Q
from .models import Post, Comment, Reaction
from .serializers import PostSerializer, CommentSerializer, ReactionSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filterset_fields = ["post_type", "author", "is_verified"]
    search_fields = ["content", "location"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Post.objects.filter(Q(is_public=True) & Q(is_active=True)).annotate(
            comment_count=Count("comments", filter=Q(comments__is_active=True)),
            reaction_count=Count("reactions"),
        )

    def create(self, request, *args, **kwargs):
        try:
            # Handle FormData
            data = {}
            for key, value in request.data.items():
                data[key] = value

            # Handle file upload
            if "image" in request.FILES:
                data["image"] = request.FILES["image"]

            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                # Pass the author to save method
                serializer.save(author=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(
                {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback

            print(traceback.format_exc())  # Print full traceback for debugging
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,  # Changed to 500 for server errors
            )

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        if post.has_user_liked(request.user):
            post.likes.remove(request.user)
            return Response({"status": "unliked"})
        else:
            post.likes.add(request.user)
            return Response({"status": "liked"})

    @action(detail=True, methods=["post"])
    def react(self, request, pk=None):
        post = self.get_object()
        reaction_type = request.data.get("reaction_type")

        if not reaction_type:
            return Response(
                {"detail": "reaction_type is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reaction, created = Reaction.objects.get_or_create(
            post=post, user=request.user, reaction_type=reaction_type
        )

        if not created:
            # If reaction already exists, remove it (toggle)
            reaction.delete()
            return Response({"status": "reaction removed"}, status=status.HTTP_200_OK)

        serializer = ReactionSerializer(reaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        post = self.get_object()
        comments = post.comments.filter(is_active=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def reactions(self, request, pk=None):
        post = self.get_object()
        reactions = post.reactions.all()
        serializer = ReactionSerializer(reactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_posts(self, request):
        posts = self.get_queryset().filter(author=request.user)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radius = request.query_params.get("radius", 10)  # default 10km

        if not lat or not lng:
            return Response(
                {"detail": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: Implement geospatial query using PostGIS
        return Response(
            {"detail": "Geospatial search not implemented yet"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs["post_pk"])

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs["post_pk"])
        serializer.save(post=post, author=self.request.user)
