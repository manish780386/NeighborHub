import math
from django.db import models
from django.conf import settings


class Post(models.Model):
    TYPE_CHOICES = [
        ('help',  'Help Request'),
        ('lost',  'Lost & Found'),
        ('event', 'Event'),
        ('sale',  'Sale'),
        ('alert', 'Alert'),
    ]

    author    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    post_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='help')
    title     = models.CharField(max_length=200)
    body      = models.TextField()
    latitude  = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    upvotes   = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='upvoted_posts', blank=True)
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at= models.DateTimeField(auto_now=True)
    group     = models.ForeignKey('groups.Group', null=True, blank=True, on_delete=models.SET_NULL, related_name='posts')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.post_type}] {self.title}'

    def distance_to(self, lat, lng):
        if not (self.latitude and self.longitude):
            return None
        R = 6371000
        phi1, phi2 = math.radians(self.latitude), math.radians(lat)
        dphi = math.radians(lat - self.latitude)
        dlam = math.radians(lng - self.longitude)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


class PostMedia(models.Model):
    post  = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media_files')
    file  = models.ImageField(upload_to='posts/')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']


class Comment(models.Model):
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author} on {self.post}'