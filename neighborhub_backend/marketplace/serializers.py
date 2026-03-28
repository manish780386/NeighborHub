from rest_framework import serializers
from .models import Listing, ListingImage
from accounts.serializers import UserSerializer


class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model  = ListingImage
        fields = ['id', 'url', 'order']

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class ListingSerializer(serializers.ModelSerializer):
    seller        = UserSerializer(read_only=True)
    images        = ListingImageSerializer(many=True, read_only=True)
    images_upload = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model  = Listing
        fields = [
            'id', 'seller', 'title', 'description',
            'price', 'category', 'condition', 'status',
            'images', 'images_upload',
            'latitude', 'longitude',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']

    def create(self, validated_data):
        files   = validated_data.pop('images_upload', [])
        listing = Listing.objects.create(**validated_data)
        for i, f in enumerate(files):
            ListingImage.objects.create(listing=listing, image=f, order=i)
        return listing

    def update(self, instance, validated_data):
        validated_data.pop('images_upload', None)
        return super().update(instance, validated_data)