from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
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
    permission_classes = (AllowAny,)
    serializer_class = TherapistListSerializer

class MeView(APIView):
    """Returns the current authenticated user's profile including their role."""
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'email': user.email,
        })

class UserDetailView(APIView):
    """Returns basic info for a given user ID (used by frontend to resolve client names)."""
    permission_classes = (IsAuthenticated,)
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            return Response({'id': user.id, 'username': user.username, 'role': user.role})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)