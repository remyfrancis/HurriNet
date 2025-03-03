from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email"]


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "author", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "content",
            "image_url",
            "author",
            "created_at",
            "updated_at",
            "is_public",
            "comments",
            "like_count",
            "has_liked",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_image_url(self, obj):
        if obj.image:
            return self.context["request"].build_absolute_uri(obj.image.url)
        return None

    def get_like_count(self, obj):
        return obj.like_count()

    def get_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.has_user_liked(request.user)
        return False

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
