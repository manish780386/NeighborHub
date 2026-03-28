from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('actor')


class MarkAllReadView(APIView):
    def post(self, request):
        Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({'status': 'ok'})


class MarkReadView(APIView):
    def post(self, request, pk):
        Notification.objects.filter(
            pk=pk, recipient=request.user
        ).update(is_read=True)
        return Response({'status': 'ok'})


class UnreadCountView(APIView):
    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({'count': count})