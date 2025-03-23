"""
ASGI config for hurrinet project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from incidents.routing import websocket_urlpatterns
from medical.routing import websocket_urlpatterns as medical_websocket_urlpatterns

# Initialize Django ASGI application early to ensure it's ready
django_asgi_app = get_asgi_application()

# Combine websocket patterns
combined_websocket_patterns = websocket_urlpatterns + medical_websocket_urlpatterns

# Create the ASGI application
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(combined_websocket_patterns))
        ),
    }
)
