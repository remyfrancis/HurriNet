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
    "rest_framework_simplejwt",  # Add JWT support
    "corsheaders",
    "channels",
    "accounts.apps.AccountsConfig",  # Add accounts app
    "incidents.apps.IncidentsConfig",
    "resource_management.apps.ResourceManagementConfig",
    "medical.apps.MedicalConfig",
    "teams.apps.TeamsConfig",
    "utils.apps.UtilsConfig",
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

# Redis Cache Configuration
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv("REDIS_URL", "redis://redis:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "MAX_ENTRIES": 1000,
            "CULL_FREQUENCY": 3,
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "RETRY_ON_TIMEOUT": True,
            "CONNECTION_POOL_KWARGS": {"max_connections": 50},
        },
    }
}

# Cache key prefix
CACHE_KEY_PREFIX = "hurrinet"

# Cache timeout settings
CACHE_TTL = 60 * 15  # 15 minutes default
INCIDENT_CACHE_TTL = 60 * 5  # 5 minutes for incidents
WEATHER_CACHE_TTL = 60 * 30  # 30 minutes for weather data

# Channel layers configuration for WebSocket
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                (os.getenv("REDIS_HOST", "redis"), int(os.getenv("REDIS_PORT", 6379)))
            ],
            "capacity": 1500,
            "expiry": 60,
            "group_expiry": 86400,
            "channel_capacity": {
                "http.request": 100,
                "http.response!*": 100,
                "websocket.send!*": 100,
            },
        },
    }
}

# CORS settings
# CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# WebSocket settings
WEBSOCKET_URL = "/ws/incidents/"

# REST Framework settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

# JWT settings
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": "your-secret-key",  # Replace with a secure secret key in production
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Custom user model
AUTH_USER_MODEL = "accounts.User"
