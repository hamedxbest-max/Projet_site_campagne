from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ContributionViewSet,
    campay_webhook,
    campaign_stats,
    registered_students,
    api_health,
    StartTaraPayment,
    taramoney_webhook,
)

router = DefaultRouter()
router.register('contributions', ContributionViewSet, basename='contribution')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/campay/', campay_webhook, name='campay-webhook'),
    path('webhook/taramoney/', taramoney_webhook, name='taramoney-webhook'),
    path('campaign-stats/', campaign_stats, name='campaign-stats'),
    path('registered-students/', registered_students, name='registered-students'),
    path('health/', api_health, name='api-health'),
    path('taramoney/start/', StartTaraPayment.as_view(), name='taramoney-start'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
