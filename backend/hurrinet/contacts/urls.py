from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet

router = DefaultRouter()
router.register(r"contacts", ContactViewSet, basename="contact")

app_name = "contacts"

urlpatterns = [
    path("", include(router.urls)),
]
