from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone       = models.CharField(max_length=15, blank=True)
    bio         = models.TextField(blank=True)
    avatar      = models.ImageField(upload_to='avatars/', null=True, blank=True)
    area_name   = models.CharField(max_length=150, blank=True)
    latitude    = models.FloatField(null=True, blank=True)
    longitude   = models.FloatField(null=True, blank=True)
    radius_km   = models.FloatField(default=2.0)
    is_verified = models.BooleanField(default=False)

    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.username