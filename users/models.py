from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = "CLIENT", "Mostafid"
        THERAPIST = "THERAPIST", "Mo3alij"

    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.CLIENT
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def is_therapist(self):
        return self.role == self.Role.THERAPIST

    def is_client(self):
        return self.role == self.Role.CLIENT


# Profile dyal Mostafid (Client)
class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    # T9der tzid f-l-moustaqbal history d l-isticharat hna aw f app separi

    def __str__(self):
        return f"Client: {self.user.username}"


# Profile dyal Mo3alij (Therapist)
class TherapistProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='therapist_profile')
    bio = models.TextField(blank=True)
    specialty = models.CharField(max_length=150, help_text="Ex: Anxiété, Dépression, Coaching...")
    session_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Prix dyal jalsa
    session_duration_minutes = models.IntegerField(default=45) # Duree dyal jalsa (ex: 45 min)
    is_validated = models.BooleanField(default=False) # Validation mn 3nd Admin
    
    def __str__(self):
        return f"Therapist: {self.user.username} - {self.specialty}"