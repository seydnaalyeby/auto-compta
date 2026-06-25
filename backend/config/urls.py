from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.views.static import serve
from django.urls import include, path, re_path

from .frontend_views import react_app

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/operations/', include('apps.operations.urls')),
    path('api/comptabilite/', include('apps.comptabilite.urls')),
    path('api/ia/', include('apps.ia.urls')),
    path('api/financial-indicators/', include('apps.financial_indicators.urls')),
]

if settings.APP_MODE == 'desktop' or settings.BASE_DIR.parent.joinpath('web', 'build', 'index.html').exists():
    urlpatterns += [
        re_path(r'^(?!api/|admin/|media/|static/).*$', react_app, name='react_app'),
    ]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if (settings.WEB_BUILD_DIR / 'static').exists():
    urlpatterns += [
        re_path(
            r'^static/(?P<path>.*)$',
            serve,
            {'document_root': settings.WEB_BUILD_DIR / 'static'},
        ),
    ]
