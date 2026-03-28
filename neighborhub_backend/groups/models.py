from django.db import models
from django.conf import settings


class Group(models.Model):
    name          = models.CharField(max_length=150)
    description   = models.TextField(blank=True)
    avatar        = models.ImageField(upload_to='groups/', null=True, blank=True)
    admin         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_groups')
    members       = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='member_groups', blank=True)
    is_private    = models.BooleanField(default=False)
    latitude      = models.FloatField(null=True, blank=True)
    longitude     = models.FloatField(null=True, blank=True)
    area_name     = models.CharField(max_length=150, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']

    def __str__(self):
        return self.name

    @property
    def members_count(self):
        return self.members.count()