from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import ClientRegistrationSerializer, TherapistRegistrationSerializer, TherapistListSerializer

class ClientRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = ClientRegistrationSerializer

class TherapistRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = TherapistRegistrationSerializer

class TherapistListView(generics.ListAPIView):
    queryset = User.objects.filter(role=User.Role.THERAPIST)
    permission_classes = (AllowAny,) # Assuming you need to see them before login, or you can require auth
    serializer_class = TherapistListSerializer