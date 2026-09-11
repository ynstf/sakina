from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ClientRegisterView, TherapistRegisterView

urlpatterns = [
    path('register/client/', ClientRegisterView.as_view(), name='register_client'),
    path('register/therapist/', TherapistRegisterView.as_view(), name='register_therapist'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Returni Access + Refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]