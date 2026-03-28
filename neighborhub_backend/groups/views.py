from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django.shortcuts import get_object_or_404
from .models import Group
from .serializers import GroupSerializer
from posts.serializers import PostSerializer
from posts.models import Post


class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    filter_backends  = [SearchFilter]
    search_fields    = ['name', 'description', 'area_name']

    def get_queryset(self):
        qs = Group.objects.prefetch_related('members').select_related('admin')
        if self.request.query_params.get('joined') == 'true':
            qs = qs.filter(members=self.request.user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            latitude=user.latitude,
            longitude=user.longitude,
            area_name=user.area_name,
        )


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroupSerializer
    queryset = Group.objects.prefetch_related('members').select_related('admin')

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated(), IsGroupAdmin()]
        return [permissions.IsAuthenticated()]


class IsGroupAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.admin == request.user


class JoinGroupView(APIView):
    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        if group.is_private:
            return Response({'detail': 'This group is private.'}, status=status.HTTP_403_FORBIDDEN)
        group.members.add(request.user)
        return Response({'status': 'joined'})


class LeaveGroupView(APIView):
    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        
        # Agar sirf 1 member hai toh group delete kar do
        if group.members.count() <= 1:
            group.delete()
            return Response({'status': 'deleted'})
        
        # Agar admin leave karna chahta hai toh next member ko admin banao
        if group.admin == request.user:
            next_admin = group.members.exclude(id=request.user.id).first()
            group.admin = next_admin
            group.save()
        
        group.members.remove(request.user)
        return Response({'status': 'left'})


class GroupPostsView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        group = get_object_or_404(Group, pk=self.kwargs['pk'])
        return Post.objects.filter(group=group).select_related('author').prefetch_related('upvotes', 'media_files')