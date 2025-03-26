"""
Django settings for hurrinet project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Get Tomorrow API key from environment variable
TOMORROW_API_KEY = os.getenv("TOMORROW_API_KEY")
if not TOMORROW_API_KEY:
    raise ValueError("TOMORROW_API_KEY environment variable is not set")

# Cache timeout settings
CACHE_TTL = 60 * 15  # 15 minutes default
INCIDENT_CACHE_TTL = 60 * 5  # 5 minutes for incidents
WEATHER_CACHE_TTL = 60 * 30  # 30 minutes for weather data

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-+ml03ar-1q6w@+@1vu5+fs@+#mn7lk#e@h&pd(s$5dry=yt6qa"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "web"]


# Application definition

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "channels",
    "rest_framework",
    "corsheaders",
    "accounts.apps.AccountsConfig",
    "chats",
    "incidents",
    "weather",
    "alerts",
    "resource_management",
    "shelters",
    "social",
    "core",
    "feed",
    "medical.apps.MedicalConfig",
    "teams.apps.TeamsConfig",
    "contacts.apps.ContactsConfig",
]

# Add JWT settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Allow requests from the frontend
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

ROOT_URLCONF = "hurrinet.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "hurrinet.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

# GDAL Configuration
if os.name == "nt":  # Windows
    os.environ["PATH"] = r"C:\OSGeo4W\bin;" + os.environ["PATH"]
    os.environ["GDAL_DATA"] = r"C:\OSGeo4W\apps\gdal\share\gdal"
    os.environ["PROJ_LIB"] = (
        r"C:\Program Files\PostgreSQL\17\share\contrib\postgis-3.5\proj"
    )
    GDAL_LIBRARY_PATH = r"C:\OSGeo4W\bin\gdal310.dll"
else:  # Linux/Docker
    GDAL_LIBRARY_PATH = "/usr/lib/x86_64-linux-gnu/libgdal.so"
    os.environ["GDAL_DATA"] = "/usr/share/gdal"
    os.environ["PROJ_LIB"] = "/usr/share/proj"

# Database Configuration
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.getenv("POSTGRES_DB", "hurrinet_db"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "yadmon13"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# Cache Configuration
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "RETRY_ON_TIMEOUT": True,
            "MAX_CONNECTIONS": 1000,
            "CONNECTION_POOL_KWARGS": {"max_connections": 50},
        },
    }
}

# Cache key prefix to avoid collisions
CACHE_KEY_PREFIX = "hurrinet"

AUTH_USER_MODEL = "accounts.User"

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = "/app/staticfiles"
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

MEDIA_URL = "/media/"
MEDIA_ROOT = "/app/media"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "user_accounts": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# Add ASGI application
ASGI_APPLICATION = "hurrinet.routing.application"

# Channel layers configuration
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
        "CONFIG": {
            "capacity": 1500,
        },
    }
}

# For production, uncomment this and comment out the above:
# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels_redis.core.RedisChannelLayer",
#         "CONFIG": {
#             "hosts": [("127.0.0.1", 6379)],
#         },
#     }
# }

# WebSocket settings
WEBSOCKET_URL = "/ws/incidents/"

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only

# Use whitenoise for static files
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
