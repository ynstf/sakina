from django.urls import path
from .views import PostListCreateView, MyProfileView, UserProfileView

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='posts-feed'),
    path('me/', MyProfileView.as_view(), name='my-profile'),
    path('profile/<int:id>/', UserProfileView.as_view(), name='user-profile'),
]