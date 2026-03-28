from django.urls import path
from .views import RoomListCreateView, RoomDetailView, MessageListView

urlpatterns = [
    path('rooms/',                          RoomListCreateView.as_view(), name='room-list'),
    path('rooms/<uuid:pk>/',               RoomDetailView.as_view(),     name='room-detail'),
    path('rooms/<uuid:room_id>/messages/', MessageListView.as_view(),    name='message-list'),
]