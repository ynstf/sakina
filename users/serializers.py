from rest_framework import serializers
from .models import User, ClientProfile, TherapistProfile

class ClientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone_number', 'date_of_birth']

    def create(self, validated_data):
        dob = validated_data.pop('date_of_birth', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', ''),
            role=User.Role.CLIENT
        )
        ClientProfile.objects.create(user=user, date_of_birth=dob)
        return user

class TherapistRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    specialty = serializers.CharField(write_only=True)
    session_price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone_number', 'specialty', 'session_price']

    def create(self, validated_data):
        specialty = validated_data.pop('specialty')
        session_price = validated_data.pop('session_price')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', ''),
            role=User.Role.THERAPIST
        )
        TherapistProfile.objects.create(
            user=user, 
            specialty=specialty, 
            session_price=session_price
        )
        return user