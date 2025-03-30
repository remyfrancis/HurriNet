from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from chats.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from incidents.routing import websocket_urlpatterns as incident_websocket_urlpatterns
from medical.routing import websocket_urlpatterns as medical_websocket_urlpatterns
from chats.middleware import TokenAuthMiddleware

# Combine all websocket URL patterns
all_websocket_patterns = []
all_websocket_patterns.extend(chat_websocket_urlpatterns)
all_websocket_patterns.extend(incident_websocket_urlpatterns)
all_websocket_patterns.extend(medical_websocket_urlpatterns)

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": TokenAuthMiddleware(URLRouter(all_websocket_patterns)),
    }
)
