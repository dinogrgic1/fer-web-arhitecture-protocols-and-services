from albumcollection.models import Artist, Release
from albumcollection.serializer import ArtistsSerializer, ReleaseSerializer
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

class ArtistList(generics.GenericAPIView):
    queryset = Artist.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = ArtistsSerializer


class ReleaseList(generics.GenericAPIView):
    queryset = Release.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = ReleaseSerializer
