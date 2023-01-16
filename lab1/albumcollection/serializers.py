from rest_framework import serializers
from .models import Release, Artist

class ReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        queryset = Release.objects.all()
        model = Release
        fields = ('id', 'title', 'code', 'linenos', 'language', 'style')

class ArtistsSerializer(serializers.ModelSerializer):
    class Meta:
        queryset = Artist.objects.all()
        model = Artist
        fields = ('id', 'title', 'code', 'linenos', 'language', 'style')