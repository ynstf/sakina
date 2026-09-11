from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import ClientRegistrationSerializer, TherapistRegistrationSerializer

class ClientRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = ClientRegistrationSerializer

class TherapistRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = TherapistRegistrationSerializer