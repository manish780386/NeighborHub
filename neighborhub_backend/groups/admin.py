from django.contrib import admin
from .models import Group

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display      = ['name', 'admin', 'members_count', 'is_private', 'area_name', 'created_at']
    list_filter       = ['is_private']
    search_fields     = ['name', 'description', 'admin__username']
    filter_horizontal = ['members']