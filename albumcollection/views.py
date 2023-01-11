from albumcollection.models import Artist, Release
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

class ArtistList(generics.ListCreateAPIView):
    queryset = Artist.objects.all()
    permission_classes = [IsAdminUser]

class ReleaseList(generics.ListCreateAPIView):
    queryset = Release.objects.all()
    permission_classes = [IsAdminUser]