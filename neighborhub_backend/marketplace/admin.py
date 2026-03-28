from django.contrib import admin
from .models import Listing, ListingImage

class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display   = ['title', 'seller', 'price', 'category', 'condition', 'status', 'created_at']
    list_filter    = ['category', 'condition', 'status']
    search_fields  = ['title', 'description', 'seller__username']
    inlines        = [ListingImageInline]
    list_editable  = ['status']