from rest_framework import serializers
from models import Release, Artists

class ReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Release
        fields = ['id', 'title', 'code', 'linenos', 'language', 'style']

class ArtistsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artists
        fields = ['id', 'title', 'code', 'linenos', 'language', 'style']