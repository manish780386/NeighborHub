from django.contrib import admin
from .models import Room, Message

class MessageInline(admin.TabularInline):
    model  = Message
    extra  = 0
    fields = ['sender', 'content', 'created_at']
    readonly_fields = ['created_at']

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'is_group', 'created_at']
    list_filter   = ['is_group']
    inlines       = [MessageInline]
    filter_horizontal = ['members']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ['sender', 'room', 'content_preview', 'created_at']
    search_fields = ['content', 'sender__username']

    def content_preview(self, obj):
        return obj.content[:60]
    content_preview.short_description = 'Content'