from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('upvote',  'Upvote'),
        ('comment', 'Comment'),
        ('group',   'Group'),
        ('alert',   'Alert'),
        ('chat',    'Chat'),
        ('system',  'System'),
    ]

    recipient   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor       = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_notifications')
    notif_type  = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    message     = models.CharField(max_length=300)
    is_read     = models.BooleanField(default=False)
    # Generic link — store as plain string, e.g. "/posts/42/"
    link        = models.CharField(max_length=200, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.notif_type}] {self.recipient} — {self.message[:40]}'