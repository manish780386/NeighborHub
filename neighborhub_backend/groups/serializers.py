from rest_framework import serializers
from .models import Group
from accounts.serializers import UserSerializer


class GroupSerializer(serializers.ModelSerializer):
    admin         = UserSerializer(read_only=True)
    members       = UserSerializer(many=True, read_only=True)
    members_count = serializers.IntegerField(read_only=True)
    is_member     = serializers.SerializerMethodField()
    admin_id      = serializers.IntegerField(source='admin.id', read_only=True)
    avatar_url    = serializers.SerializerMethodField()

    class Meta:
        model  = Group
        fields = [
            'id', 'name', 'description', 'avatar', 'avatar_url',
            'admin', 'admin_id', 'members', 'members_count',
            'is_private', 'is_member', 'area_name',
            'latitude', 'longitude', 'created_at', 'last_activity',
        ]
        read_only_fields = ['id', 'admin', 'created_at', 'last_activity']
        extra_kwargs = {'avatar': {'write_only': True, 'required': False}}

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None

    def create(self, validated_data):
        user  = self.context['request'].user
        group = Group.objects.create(**validated_data, admin=user)
        group.members.add(user)
        return group