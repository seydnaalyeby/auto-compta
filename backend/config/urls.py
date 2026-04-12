from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/operations/', include('apps.operations.urls')),
    path('api/comptabilite/', include('apps.comptabilite.urls')),
    path('api/ia/', include('apps.ia.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
