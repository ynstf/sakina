from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, ClientProfile, TherapistProfile


class UserAuthTests(APITestCase):

    def setUp(self):
        # URLs reverse name (kima difiniwahom f users/urls.py)
        self.client_register_url = reverse('register_client')
        self.therapist_register_url = reverse('register_therapist')
        self.login_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')

        # Dummy data
        self.client_data = {
            "username": "client_test",
            "email": "client@sakina.ma",
            "password": "Password123!",
            "phone_number": "0600000001",
            "date_of_birth": "1998-05-20"
        }

        self.therapist_data = {
            "username": "therapist_test",
            "email": "therapist@sakina.ma",
            "password": "Password123!",
            "phone_number": "0600000002",
            "specialty": "Anxiété & Dépression",
            "session_price": "300.00"
        }

    def test_register_client(self):
        """Test Client Registration + Profile Creation"""
        response = self.client.post(self.client_register_url, self.client_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)

        user = User.objects.get(username="client_test")
        self.assertEqual(user.role, User.Role.CLIENT)
        self.assertTrue(ClientProfile.objects.filter(user=user).exists())

    def test_register_therapist(self):
        """Test Therapist Registration + Profile Creation"""
        response = self.client.post(self.therapist_register_url, self.therapist_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)

        user = User.objects.get(username="therapist_test")
        self.assertEqual(user.role, User.Role.THERAPIST)
        
        profile = TherapistProfile.objects.get(user=user)
        self.assertEqual(profile.specialty, "Anxiété & Dépression")
        self.assertEqual(str(profile.session_price), "300.00")

    def test_login_and_token_refresh(self):
        """Test Login (Obtain Tokens) + Refresh Token Flow"""
        # 1. Register Client first
        self.client.post(self.client_register_url, self.client_data, format='json')

        # 2. Test Login
        login_data = {
            "username": self.client_data["username"],
            "password": self.client_data["password"]
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)

        # 3. Test Refreshing Access Token
        refresh_token = login_response.data['refresh']
        refresh_data = {"refresh": refresh_token}
        
        refresh_response = self.client.post(self.refresh_url, refresh_data, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)