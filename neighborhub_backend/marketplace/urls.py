from django.urls import path
from .views import ListingListCreateView, ListingDetailView, MyListingsView

urlpatterns = [
    path('listings/',          ListingListCreateView.as_view(), name='listing-list'),
    path('listings/<int:pk>/', ListingDetailView.as_view(),     name='listing-detail'),
    path('my-listings/',       MyListingsView.as_view(),        name='my-listings'),
]