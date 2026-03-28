from rest_framework import serializers
from .models import Post, PostMedia, Comment
from accounts.serializers import UserSerializer


class PostMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model  = PostMedia
        fields = ['id', 'url', 'order']

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model  = Comment
        fields = ['id', 'author', 'body', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author         = UserSerializer(read_only=True)
    media          = PostMediaSerializer(source='media_files', many=True, read_only=True)
    upvotes_count  = serializers.SerializerMethodField()
    is_upvoted     = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    distance       = serializers.SerializerMethodField()
    media_upload   = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model  = Post
        fields = [
            'id', 'author', 'post_type', 'title', 'body',
            'latitude', 'longitude', 'media', 'media_upload',
            'upvotes_count', 'is_upvoted', 'comments_count',
            'distance', 'group', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_upvotes_count(self, obj):
        return obj.upvotes.count()

    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(id=request.user.id).exists()
        return False

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_distance(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        lat = request.query_params.get('lat') or getattr(request.user, 'latitude', None)
        lng = request.query_params.get('lng') or getattr(request.user, 'longitude', None)
        if lat and lng:
            return obj.distance_to(float(lat), float(lng))
        return None

    def create(self, validated_data):
        files = validated_data.pop('media_upload', [])
        post  = Post.objects.create(**validated_data)
        for i, f in enumerate(files):
            PostMedia.objects.create(post=post, file=f, order=i)
        return post