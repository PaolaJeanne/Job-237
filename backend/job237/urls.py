from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def healthz(request):
    engine = settings.DATABASES['default']['ENGINE']
    return JsonResponse({
        'status': 'ok',
        'environment': settings.ENVIRONMENT,
        'debug': settings.DEBUG,
        'database': engine.split('.')[-1],
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthz/', healthz, name='healthz'),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('profiles.urls')),
    path('api/', include('companies.urls')),
    path('api/', include('jobs.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('comments.urls')),
    path('api/', include('messaging.urls')),
    path('api/', include('notes.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
