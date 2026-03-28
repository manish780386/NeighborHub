from rest_framework import serializers
from .models import Notification
from accounts.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model  = Notification
        fields = ['id', 'actor', 'notif_type', 'message', 'is_read', 'link', 'created_at']
        read_only_fields = ['id', 'created_at']