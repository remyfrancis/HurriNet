from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"facilities", views.MedicalFacilityViewSet)
router.register(r"supplies", views.MedicalSupplyViewSet)
router.register(r"emergencies", views.MedicalEmergencyViewSet)
router.register(
    r"status-reports",
    views.FacilityStatusReportViewSet,
    basename="facility-status-report",
)

app_name = "medical"

# Make sure to include the router.urls directly in the urlpatterns
urlpatterns = router.urls
