from django.db import models
from django.conf import settings


class Listing(models.Model):
    CATEGORY_CHOICES = [
        ('furniture',   'Furniture'),
        ('electronics', 'Electronics'),
        ('clothing',    'Clothing'),
        ('vehicles',    'Vehicles'),
        ('services',    'Services'),
        ('other',       'Other'),
    ]
    CONDITION_CHOICES = [
        ('new',      'New'),
        ('like_new', 'Like New'),
        ('good',     'Good'),
        ('fair',     'Fair'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold',   'Sold'),
        ('hidden', 'Hidden'),
    ]

    seller      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price       = models.PositiveIntegerField(default=0)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    condition   = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    latitude    = models.FloatField(null=True, blank=True)
    longitude   = models.FloatField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} — ₹{self.price}'


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image   = models.ImageField(upload_to='marketplace/')
    order   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']