import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

# Static files configuration
STATIC_URL = "/static/"
STATIC_ROOT = str(BASE_DIR / "staticfiles")
STATICFILES_DIRS = [
    str(BASE_DIR / "static"),
]

# Media files configuration
MEDIA_URL = "/media/"
MEDIA_ROOT = str(BASE_DIR / "media")

# Add 'django.contrib.gis' to INSTALLED_APPS
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",  # Add GeoDjango
    "rest_framework",
    "rest_framework_gis",  # Add DRF GIS support
    "corsheaders",
    "channels",
    "incidents.apps.IncidentsConfig",
    "teams.apps.TeamsConfig",
]

# Database configuration for PostGIS
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "hurrinet_db",
        "USER": "postgres",
        "PASSWORD": "yadmon13",
        "HOST": "hurrinet-db-1",
        "PORT": "5432",
    }
}

# Root URL Configuration
ROOT_URLCONF = "hurrinet.urls"

# Add Channels configuration
ASGI_APPLICATION = "hurrinet.asgi.application"

# Channel layers configuration - Using in-memory layer for development
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True

# WebSocket settings
WEBSOCKET_URL = "/ws/incidents/"
