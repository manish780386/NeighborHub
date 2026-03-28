import uuid
from django.db import models
from django.conf import settings


class Room(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name       = models.CharField(max_length=150, blank=True)
    is_group   = models.BooleanField(default=False)
    members    = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    admin      = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name='admin_rooms')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name or f'DM-{self.id}'

    def get_other_member(self, user):
        return self.members.exclude(id=user.id).first()


class Message(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    sender     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content    = models.TextField()
    read_by    = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='read_messages', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:40]}'