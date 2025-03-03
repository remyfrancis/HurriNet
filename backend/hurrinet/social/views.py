from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(is_public=True)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        if post.has_user_liked(request.user):
            post.likes.remove(request.user)
        else:
            post.likes.add(request.user)
        serializer = self.get_serializer(post)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs["post_pk"])

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs["post_pk"])
        serializer.save(post=post, author=self.request.user)
