from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from campaign.views import api_health

urlpatterns = [
    path('', api_health),
    path('admin/', admin.site.urls),
    path('api/', include('campaign.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
