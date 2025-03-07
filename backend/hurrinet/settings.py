# Add 'channels' to INSTALLED_APPS
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "channels",
    "incidents.apps.IncidentsConfig",
]

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
