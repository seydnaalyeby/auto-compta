from django.contrib.auth.models import AbstractUser
from django.db import models

class Utilisateur(AbstractUser):
    nom_entreprise = models.CharField(max_length=200, verbose_name="Nom de l'entreprise")
    secteur = models.CharField(max_length=100, blank=True, verbose_name="Secteur d'activité")
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.nom_entreprise} ({self.username})"
