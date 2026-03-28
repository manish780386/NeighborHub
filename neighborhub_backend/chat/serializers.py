from rest_framework import serializers
from .models import Room, Message
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'content', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class RoomSerializer(serializers.ModelSerializer):
    members      = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    member_id    = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model  = Room
        fields = ['id', 'name', 'is_group', 'members', 'member_id',
                  'last_message', 'unread_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_last_message(self, obj):
        msg = obj.messages.first()
        if msg:
            return {
                'content':    msg.content,
                'sender':     msg.sender.username,
                'created_at': msg.created_at,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.exclude(read_by=request.user).exclude(sender=request.user).count()

    def create(self, validated_data):
        member_id = validated_data.pop('member_id', None)
        request   = self.context['request']
        me        = request.user

        if member_id and not validated_data.get('is_group'):
            from accounts.models import User
            other = User.objects.get(pk=member_id)
            # Check if DM already exists
            existing = Room.objects.filter(is_group=False, members=me).filter(members=other).first()
            if existing:
                return existing
            room = Room.objects.create(is_group=False)
            room.members.set([me, other])
            return room

        room = Room.objects.create(**validated_data, admin=me)
        room.members.add(me)
        return room