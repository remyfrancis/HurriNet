#!/usr/bin/env python
"""
Script to generate test news feed data for the HurriNet application.

This script creates sample news articles and announcements for the news feed.

Usage:
    python generate_test_feeds.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
django.setup()

# Check if news app is available
from django.conf import settings

if "news" not in [app.split(".")[-1] for app in settings.INSTALLED_APPS]:
    print("News app is not installed. Cannot generate news feed data.")
    sys.exit(1)

# Import models after Django setup
from django.contrib.auth import get_user_model
from news.models import NewsArticle, Announcement

User = get_user_model()


def create_test_feeds():
    """Create test news articles and announcements."""

    # Get or create admin user for authorship
    try:
        admin_user = User.objects.get(email="admin@hurrinet.org")
    except User.DoesNotExist:
        print("Admin user not found. Please run generate_test_users.py first.")
        return [], []

    # Clear existing news and announcements
    NewsArticle.objects.all().delete()
    Announcement.objects.all().delete()
    print("Cleared existing news and announcements.")

    # Current time for reference
    now = datetime.now()

    # Define test news articles
    test_articles = [
        {
            "title": "Hurricane Preparedness Week Begins",
            "content": """
            The National Emergency Management Organization (NEMO) has announced that Hurricane Preparedness Week will begin on Monday.
            
            During this week, residents are encouraged to:
            - Review and update their emergency plans
            - Stock up on emergency supplies
            - Secure important documents
            - Check and maintain emergency equipment
            - Stay informed about evacuation routes
            
            NEMO will be hosting workshops in various communities throughout the week to help residents prepare for the hurricane season.
            """,
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=2),
            "category": "PREPAREDNESS",
            "image_url": "https://example.com/images/hurricane-prep.jpg",
        },
        {
            "title": "New Emergency Shelters Designated",
            "content": """
            The government has designated 15 new emergency shelters across the island to improve evacuation capacity during disasters.
            
            The new shelters include:
            - 5 schools in the northern region
            - 4 community centers in the central region
            - 6 government buildings in the southern region
            
            All shelters have been equipped with emergency power generators, water storage, and basic medical supplies.
            
            A complete list of all emergency shelters is available on the NEMO website.
            """,
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=5),
            "category": "INFRASTRUCTURE",
            "image_url": "https://example.com/images/shelters.jpg",
        },
        {
            "title": "Weather Monitoring System Upgraded",
            "content": """
            The Meteorological Services Department has completed a major upgrade to the island's weather monitoring system.
            
            The upgrades include:
            - New Doppler radar installation
            - Additional automated weather stations
            - Improved satellite communication systems
            - Enhanced early warning capabilities
            
            These improvements will allow for more accurate and timely weather forecasts and warnings, particularly during the hurricane season.
            """,
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=10),
            "category": "TECHNOLOGY",
            "image_url": "https://example.com/images/weather-system.jpg",
        },
        {
            "title": "Community Disaster Response Teams Formed",
            "content": """
            NEMO has announced the formation of Community Disaster Response Teams (CDRTs) in 25 communities across Saint Lucia.
            
            These teams have received specialized training in:
            - Basic disaster response
            - First aid and CPR
            - Light search and rescue
            - Fire safety
            - Disaster psychology
            
            The CDRTs will serve as first responders in their communities during emergencies until professional help arrives.
            """,
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=15),
            "category": "COMMUNITY",
            "image_url": "https://example.com/images/response-teams.jpg",
        },
        {
            "title": "Hurricane Relief Fund Established",
            "content": """
            The government has established a Hurricane Relief Fund to provide financial assistance to those affected by hurricanes.
            
            The fund will:
            - Provide immediate financial assistance to affected households
            - Support rebuilding of damaged homes
            - Assist with recovery of small businesses
            - Fund community infrastructure repairs
            
            Donations to the fund can be made through the National Treasury or any branch of local banks.
            """,
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=20),
            "category": "RECOVERY",
            "image_url": "https://example.com/images/relief-fund.jpg",
        },
    ]

    # Define test announcements
    test_announcements = [
        {
            "title": "Emergency Evacuation Drill",
            "content": "An emergency evacuation drill will be conducted in Castries on Saturday at 10:00 AM. All residents are encouraged to participate.",
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(hours=12),
            "priority": "MEDIUM",
            "expiry_date": now + timedelta(days=3),
        },
        {
            "title": "Water Conservation Notice",
            "content": "Due to drought conditions, water conservation measures are in effect. Please limit non-essential water usage until further notice.",
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=1),
            "priority": "HIGH",
            "expiry_date": now + timedelta(days=30),
        },
        {
            "title": "Emergency Services Phone Numbers Updated",
            "content": "The emergency services contact numbers have been updated. Please visit the NEMO website for the new contact information.",
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=3),
            "priority": "LOW",
            "expiry_date": now + timedelta(days=14),
        },
        {
            "title": "Hurricane Preparedness Workshop",
            "content": "A hurricane preparedness workshop will be held at the Castries Community Center on Sunday at 2:00 PM. All are welcome to attend.",
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(days=2),
            "priority": "MEDIUM",
            "expiry_date": now + timedelta(days=5),
        },
        {
            "title": "Emergency Alert System Test",
            "content": "The national emergency alert system will be tested on Monday at 12:00 PM. This is only a test and no action is required.",
            "author": admin_user,
            "is_published": True,
            "published_date": now - timedelta(hours=6),
            "priority": "HIGH",
            "expiry_date": now + timedelta(days=2),
        },
    ]

    # Create news articles
    created_articles = []
    for article_data in test_articles:
        try:
            article = NewsArticle.objects.create(**article_data)
            created_articles.append(article)
            print(f"Created news article: {article.title}")
        except Exception as e:
            print(f"Error creating news article {article_data['title']}: {str(e)}")

    # Create announcements
    created_announcements = []
    for announcement_data in test_announcements:
        try:
            announcement = Announcement.objects.create(**announcement_data)
            created_announcements.append(announcement)
            print(f"Created announcement: {announcement.title}")
        except Exception as e:
            print(f"Error creating announcement {announcement_data['title']}: {str(e)}")

    return created_articles, created_announcements


if __name__ == "__main__":
    print("Generating test news feed data for HurriNet...")
    articles, announcements = create_test_feeds()
    print(
        f"Created {len(articles)} news articles and {len(announcements)} announcements."
    )
