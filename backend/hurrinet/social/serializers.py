from rest_framework import serializers
from .models import Post, Comment, Reaction
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]


class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reaction_type_display = serializers.CharField(
        source="get_reaction_type_display", read_only=True
    )

    class Meta:
        model = Reaction
        fields = [
            "id",
            "post",
            "user",
            "reaction_type",
            "reaction_type_display",
            "created_at",
        ]
        read_only_fields = ["post", "user"]


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "content",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = ["post", "author", "is_active"]


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    verified_by = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    post_type_display = serializers.CharField(
        source="get_post_type_display", read_only=True
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "content",
            "post_type",
            "post_type_display",
            "image_url",
            "location",
            "latitude",
            "longitude",
            "author",
            "created_at",
            "updated_at",
            "is_active",
            "is_public",
            "is_verified",
            "verified_by",
            "comments",
            "reactions",
            "like_count",
            "has_liked",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
            "is_verified",
            "verified_by",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

    def get_like_count(self, obj):
        return obj.like_count()

    def get_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.has_user_liked(request.user)
        return False

    def create(self, validated_data):
        # Set default values
        validated_data["is_active"] = True
        validated_data["is_public"] = True
        validated_data["post_type"] = validated_data.get("post_type", "GENERAL")

        # Create the post instance
        post = Post.objects.create(**validated_data)
        return post
