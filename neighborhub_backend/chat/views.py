from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer


class RoomListCreateView(generics.ListCreateAPIView):
    serializer_class = RoomSerializer

    def get_queryset(self):
        return (
            Room.objects
            .filter(members=self.request.user)
            .prefetch_related('members', 'messages')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save()


class RoomDetailView(generics.RetrieveAPIView):
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.filter(members=self.request.user).prefetch_related('members')


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room = get_object_or_404(Room, id=self.kwargs['room_id'], members=self.request.user)
        msgs = room.messages.select_related('sender').order_by('created_at')
        # Mark as read
        for msg in msgs.exclude(sender=self.request.user):
            msg.read_by.add(self.request.user)
        return msgs