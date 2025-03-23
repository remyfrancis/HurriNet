from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, TeamMemberViewSet

router = DefaultRouter()
router.register(r"teams", TeamViewSet)
router.register(r"team-members", TeamMemberViewSet)

app_name = "teams"

urlpatterns = [
    path("", include(router.urls)),
]
