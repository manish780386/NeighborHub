from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Listing
from .serializers import ListingSerializer


class IsSellerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user


class ListingListCreateView(generics.ListCreateAPIView):
    serializer_class = ListingSerializer
    filter_backends  = [SearchFilter, OrderingFilter]
    search_fields    = ['title', 'description', 'category']
    ordering_fields  = ['created_at', 'price']

    def get_queryset(self):
        qs       = Listing.objects.filter(status='active').select_related('seller').prefetch_related('images')
        category = self.request.query_params.get('category')
        seller   = self.request.query_params.get('seller')
        if category:
            qs = qs.filter(category=category)
        if seller:
            qs = qs.filter(seller_id=seller)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            seller=user,
            latitude=user.latitude,
            longitude=user.longitude,
        )


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsSellerOrReadOnly]
    queryset = Listing.objects.select_related('seller').prefetch_related('images')

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        listing.status = 'hidden'
        listing.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyListingsView(generics.ListAPIView):
    serializer_class = ListingSerializer

    def get_queryset(self):
        return Listing.objects.filter(
            seller=self.request.user
        ).select_related('seller').prefetch_related('images')