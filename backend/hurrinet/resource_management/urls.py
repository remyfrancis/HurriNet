from django.urls import path
from . import views

urlpatterns = [
    path("inventory/", views.inventory_list, name="inventory-list"),
    path("requests/", views.resource_requests, name="resource-requests"),
    path("distribution/", views.distribution_status, name="distribution-status"),
]
