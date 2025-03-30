from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"resources", views.ResourceViewSet)
router.register(r"inventory", views.InventoryItemViewSet)
router.register(r"requests", views.ResourceRequestViewSet)
router.register(r"suppliers", views.SupplierViewSet)
router.register(r"distributions", views.DistributionViewSet)
router.register(r"transfers", views.TransferViewSet)

urlpatterns = [
    # Define specific inventory paths BEFORE including the router
    path(
        "inventory/last-update/",
        views.LastInventoryUpdateView.as_view(),
        name="inventory-last-update",
    ),
    path(
        "inventory/aggregated-stock-levels/",
        views.InventoryItemViewSet.as_view({"get": "aggregated_stock_levels"}),
        name="aggregated-stock-levels",
    ),
    path(
        "inventory/stock-status/",
        views.InventoryItemViewSet.as_view({"get": "stock_status"}),
        name="stock-status",
    ),
    path(
        "inventory/allocate/",
        views.InventoryItemViewSet.as_view({"post": "allocate"}),
        name="inventory-allocate",
    ),
    path(
        "inventory/with_status/",
        views.InventoryItemViewSet.as_view({"get": "with_status"}),
        name="inventory-with-status",
    ),
    # Now include the main router URLs
    path("", include(router.urls)),
    # Other paths (keep resource-specific ones separate if preferred)
    path(
        "resources/<int:pk>/stock-levels/",
        views.ResourceViewSet.as_view({"get": "stock_levels"}),
        name="resource-stock-levels",
    ),
    path(
        "resources/all-stock-levels/",
        views.ResourceViewSet.as_view({"get": "all_stock_levels"}),
        name="all-stock-levels",
    ),
    path(
        "allocate-procurement/",
        views.allocate_procurement_resources,
        name="allocate-procurement",
    ),
    path("test/", views.api_test, name="api-test"),
]
