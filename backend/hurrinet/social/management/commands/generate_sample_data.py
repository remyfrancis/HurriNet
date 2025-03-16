"""
Django management command to generate sample data for testing HurriNet.

This command creates sample posts, comments, and reactions for testing purposes.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from social.models import Post, Comment, Reaction
from django.utils import timezone
import random
from faker import Faker

User = get_user_model()
fake = Faker()


class Command(BaseCommand):
    help = "Generates sample data for testing HurriNet"

    def add_arguments(self, parser):
        parser.add_argument(
            "--posts", type=int, default=20, help="Number of posts to create"
        )
        parser.add_argument(
            "--comments", type=int, default=50, help="Number of comments to create"
        )
        parser.add_argument(
            "--reactions", type=int, default=100, help="Number of reactions to create"
        )

    def handle(self, *args, **options):
        num_posts = options["posts"]
        num_comments = options["comments"]
        num_reactions = options["reactions"]

        self.stdout.write("Creating sample data...")

        # Get existing users
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                self.style.ERROR(
                    "No users found in database. Please create users first."
                )
            )
            return

        # Create sample posts
        post_types = [
            "UPDATE",
            "HELP_REQUEST",
            "OFFER_HELP",
            "INFO",
            "WARNING",
            "GENERAL",
        ]
        for _ in range(num_posts):
            author = random.choice(users)
            post = Post.objects.create(
                author=author,
                content=fake.paragraph(),
                post_type=random.choice(post_types),
                location=fake.city(),
                latitude=float(fake.latitude()),
                longitude=float(fake.longitude()),
                is_verified=random.choice([True, False]),
                verified_by=random.choice(users) if random.random() > 0.7 else None,
            )
            # Add random likes
            for _ in range(random.randint(0, 10)):
                post.likes.add(random.choice(users))

            self.stdout.write(f"Created post: {post.post_type} by {post.author.email}")

        # Create sample comments
        posts = list(Post.objects.all())
        for _ in range(num_comments):
            post = random.choice(posts)
            author = random.choice(users)
            comment = Comment.objects.create(
                post=post,
                author=author,
                content=fake.sentence(),
                is_active=True,
            )
            self.stdout.write(
                f"Created comment by {comment.author.email} on post {comment.post.id}"
            )

        # Create sample reactions
        reaction_types = ["LIKE", "HELPFUL", "IMPORTANT", "FLAG"]
        for _ in range(num_reactions):
            post = random.choice(posts)
            user = random.choice(users)
            reaction_type = random.choice(reaction_types)

            # Avoid duplicate reactions
            if not Reaction.objects.filter(
                post=post, user=user, reaction_type=reaction_type
            ).exists():
                reaction = Reaction.objects.create(
                    post=post,
                    user=user,
                    reaction_type=reaction_type,
                )
                self.stdout.write(
                    f"Created {reaction.reaction_type} reaction by {reaction.user.email}"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"""
Successfully created:
- {num_posts} posts
- {num_comments} comments
- {num_reactions} reactions
"""
            )
        )
