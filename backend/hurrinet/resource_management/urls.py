from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"resources", views.ResourceViewSet)
router.register(r"inventory", views.InventoryItemViewSet)
router.register(r"requests", views.ResourceRequestViewSet)
router.register(r"suppliers", views.SupplierViewSet)
router.register(r"distributions", views.DistributionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    # Explicitly register the with_status action
    path(
        "inventory/with_status/",
        views.InventoryItemViewSet.as_view({"get": "with_status"}),
        name="inventory-with-status",
    ),
    # Procurement allocation endpoint
    path(
        "allocate-procurement/",
        views.allocate_procurement_resources,
        name="allocate-procurement",
    ),
    # Test endpoint
    path("test/", views.api_test, name="api-test"),
]
