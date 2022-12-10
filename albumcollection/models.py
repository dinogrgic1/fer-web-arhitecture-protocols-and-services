from django.db import models
from django_countries.fields import CountryField

class Artist(models.Model):
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    born = models.DateTimeField(auto_now_add=False)
    died = models.DateTimeField(auto_now_add=False, blank=True)
    genres = models.TextField()
    nicknames = models.TextField(blank=True)
    biography = models.TextField(blank=True)
    country = CountryField()

    class Meta:
        ordering = ['first_name', 'last_name']

class Release(models.Model):
    RELEASE_TYPES = [
        ('AL', 'Album'),
        ('EP', 'Extended play'),
        ('CO', 'Compilation'),
        ('SI', 'Single'),
        ('MX', 'Mixtape'),
    ]

    models.ForeignKey(Artist, on_delete=models.CASCADE)    
    name = models.TextField()
    release_type = models.CharField(choices=RELEASE_TYPES, max_length=100, blank=True, default='')
    released = models.DateTimeField(auto_now_add=False)
    genres = models.TextField()
    language = CountryField()
    descriptors = models.TextField()

    class Meta:
        ordering = ['name']