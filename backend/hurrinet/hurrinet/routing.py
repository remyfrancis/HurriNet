from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from chats.routing import websocket_urlpatterns
from chats.middleware import TokenAuthMiddleware

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": TokenAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
