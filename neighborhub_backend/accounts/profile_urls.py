from django.urls import path
from .views import UserListView, UserDetailView, MeView

urlpatterns = [
    path('me/',           MeView.as_view(),        name='profile-me'),
    path('users/',        UserListView.as_view(),   name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]