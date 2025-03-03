from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShelterViewSet

router = DefaultRouter()
router.register(r"", ShelterViewSet, basename="shelter")

urlpatterns = [
    path("", include(router.urls)),
]
