import math
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


def haversine_distance(lat1, lng1, lat2, lng2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


class FeedView(generics.ListAPIView):
    """Nearby feed — filters posts within radius using Haversine."""
    serializer_class = PostSerializer

    def get_queryset(self):
        user   = self.request.user
        params = self.request.query_params

        lat = float(params.get('lat') or user.latitude or 0)
        lng = float(params.get('lng') or user.longitude or 0)
        radius_km  = float(params.get('radius', user.radius_km or 2))
        post_type  = params.get('post_type')
        author_id  = params.get('author')

        qs = Post.objects.select_related('author').prefetch_related('upvotes', 'media_files', 'comments')

        if post_type:
            qs = qs.filter(post_type=post_type)
        if author_id:
            qs = qs.filter(author_id=author_id)

        if lat and lng:
            radius_m = radius_km * 1000
            # Rough bounding box first (fast), then Haversine filter
            lat_delta = radius_km / 111.0
            lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
            qs = qs.filter(
                latitude__range=(lat - lat_delta, lat + lat_delta),
                longitude__range=(lng - lng_delta, lng + lng_delta),
            )
            # Precise filter
            ids = [p.id for p in qs if p.latitude and p.longitude and
                   haversine_distance(lat, lng, p.latitude, p.longitude) <= radius_m]
            qs = Post.objects.filter(id__in=ids).select_related('author').prefetch_related('upvotes', 'media_files', 'comments')

        return qs.order_by('-created_at')


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    filter_backends  = [SearchFilter, OrderingFilter]
    search_fields    = ['title', 'body']
    ordering_fields  = ['created_at']

    def get_queryset(self):
        qs = Post.objects.select_related('author').prefetch_related('upvotes', 'media_files', 'comments')
        author = self.request.query_params.get('author')
        if author:
            qs = qs.filter(author_id=author)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            author=user,
            latitude=self.request.data.get('latitude') or user.latitude,
            longitude=self.request.data.get('longitude') or user.longitude,
        )


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    queryset = Post.objects.select_related('author').prefetch_related('upvotes', 'media_files', 'comments')

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated(), IsPostAuthor()]
        return [permissions.IsAuthenticated()]


class IsPostAuthor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.author == request.user


class UpvoteView(APIView):
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if post.upvotes.filter(id=request.user.id).exists():
            post.upvotes.remove(request.user)
            action = 'removed'
        else:
            post.upvotes.add(request.user)
            action = 'added'
        return Response({'action': action, 'count': post.upvotes.count()})


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['pk']).select_related('author')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, post=post)