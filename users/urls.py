from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ClientRegisterView, TherapistRegisterView, TherapistListView, MeView, UserDetailView

urlpatterns = [
    path('register/client/', ClientRegisterView.as_view(), name='register_client'),
    path('register/therapist/', TherapistRegisterView.as_view(), name='register_therapist'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('therapists/', TherapistListView.as_view(), name='list_therapists'),
    path('me/', MeView.as_view(), name='me'),
    path('user/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
]