# hurrinet/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse


# Health check view
def health_check(request):
    return HttpResponse("OK", status=200)


urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("admin/", admin.site.urls),
    path(
        "api/",
        include(
            [
                path("incidents/", include("incidents.urls")),
                path("accounts/", include("accounts.urls")),
            ]
        ),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
