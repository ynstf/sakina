from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ClientProfile, TherapistProfile

admin.site.register(User, UserAdmin)
admin.site.register(ClientProfile)
admin.site.register(TherapistProfile)