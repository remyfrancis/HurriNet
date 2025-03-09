from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"resources", views.ResourceViewSet)
router.register(r"inventory", views.InventoryItemViewSet)
router.register(r"requests", views.ResourceRequestViewSet)
router.register(r"distributions", views.DistributionViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
