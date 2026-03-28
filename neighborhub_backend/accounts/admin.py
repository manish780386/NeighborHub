from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'email', 'full_name', 'area_name', 'is_verified', 'date_joined']
    list_filter   = ['is_verified', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'area_name']
    fieldsets     = UserAdmin.fieldsets + (
        ('NeighborHub', {'fields': ('phone', 'bio', 'avatar', 'area_name', 'latitude', 'longitude', 'radius_km', 'is_verified')}),
    )