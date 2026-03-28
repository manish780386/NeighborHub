from django.contrib import admin
from .models import Post, PostMedia, Comment

class PostMediaInline(admin.TabularInline):
    model = PostMedia
    extra = 0

class CommentInline(admin.TabularInline):
    model   = Comment
    extra   = 0
    fields  = ['author', 'body', 'created_at']
    readonly_fields = ['created_at']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display   = ['title', 'post_type', 'author', 'area_name_display', 'created_at']
    list_filter    = ['post_type', 'created_at']
    search_fields  = ['title', 'body', 'author__username']
    inlines        = [PostMediaInline, CommentInline]
    readonly_fields= ['created_at', 'updated_at']

    def area_name_display(self, obj):
        return obj.author.area_name
    area_name_display.short_description = 'Area'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display  = ['author', 'post', 'created_at']
    search_fields = ['body', 'author__username']