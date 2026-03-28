from django.urls import path
from .views import FeedView, PostListCreateView, PostDetailView, UpvoteView, CommentListCreateView

urlpatterns = [
    path('feed/',               FeedView.as_view(),             name='post-feed'),
    path('',                    PostListCreateView.as_view(),    name='post-list'),
    path('<int:pk>/',           PostDetailView.as_view(),        name='post-detail'),
    path('<int:pk>/upvote/',    UpvoteView.as_view(),            name='post-upvote'),
    path('<int:pk>/comments/',  CommentListCreateView.as_view(), name='post-comments'),
]