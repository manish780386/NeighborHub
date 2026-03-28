from django.urls import path
from .views import NotificationListView, MarkAllReadView, MarkReadView, UnreadCountView

urlpatterns = [
    path('',                     NotificationListView.as_view(), name='notif-list'),
    path('mark-all-read/',       MarkAllReadView.as_view(),      name='notif-mark-all'),
    path('<int:pk>/mark-read/',  MarkReadView.as_view(),         name='notif-mark-one'),
    path('unread-count/',        UnreadCountView.as_view(),      name='notif-unread-count'),
]