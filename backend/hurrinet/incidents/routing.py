from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # re_path(r"ws/supplier-updates/$", consumers.SupplierUpdatesConsumer.as_asgi()),
    re_path(r"ws/incidents/$", consumers.IncidentConsumer.as_asgi()),
]
