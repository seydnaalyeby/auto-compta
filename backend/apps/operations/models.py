from django.db import models
from django.conf import settings

class Operation(models.Model):
    TYPE_CHOICES = [
        ('vente', 'Vente'),
        ('achat', 'Achat'),
        ('paiement', 'Paiement'),
        ('encaissement', 'Encaissement'),
        ('salaire', 'Salaire'),
        ('loyer', 'Loyer'),
        ('impot', 'Impôt'),
        ('autre', 'Autre'),
    ]
    MOYEN_CHOICES = [
        ('caisse', 'Caisse (espèces)'),
        ('banque', 'Banque (virement)'),
        ('cheque', 'Chèque'),
        ('credit', 'Crédit (non payé)'),
    ]

    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='operations'
    )
    texte_original = models.TextField(verbose_name="Texte saisi par l'utilisateur")
    type_operation = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    moyen_paiement = models.CharField(max_length=20, choices=MOYEN_CHOICES, default='caisse')
    categorie = models.CharField(max_length=100, blank=True)
    date_operation = models.DateField()
    date_creation = models.DateTimeField(auto_now_add=True)
    traitee_par_ia = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date_operation', '-date_creation']
        verbose_name = "Opération"

    def __str__(self):
        return f"{self.type_operation} - {self.montant} MRU ({self.date_operation})"


class EcritureComptable(models.Model):
    """
    Écriture comptable selon le Plan Comptable Bancaire Mauritanien (BCM 1988)
    Basé sur la codification décimale en 9 classes
    """
    operation = models.ForeignKey(
        Operation,
        on_delete=models.CASCADE,
        related_name='ecritures'
    )
    # Comptes selon Plan Comptable Mauritanien
    # Classe 1: Trésorerie (10=Caisse, 11=Institut émission, 12=Établissements crédit)
    # Classe 2: Opérations clientèle (20=Crédits, 21=Comptes clientèle)
    # Classe 3: Autres comptes financiers (32=Débiteurs/Créditeurs divers, 320=Fournisseurs)
    # Classe 4: Valeurs immobilisées (42=Immobilisations corporelles)
    # Classe 5: Capitaux permanents (59=Capital)
    # Classe 6: Charges (60=Charges exploitation, 63=Charges externes, 65=Frais personnel)
    # Classe 7: Produits (70=Produits exploitation, 71=Produits accessoires)
    # Classe 8: Résultats (82=Résultats exploitation, 87=Résultat net)
    compte_debit = models.CharField(max_length=10, verbose_name="Compte Débit (PCM)")
    libelle_debit = models.CharField(max_length=200, verbose_name="Libellé Débit")
    compte_credit = models.CharField(max_length=10, verbose_name="Compte Crédit (PCM)")
    libelle_credit = models.CharField(max_length=200, verbose_name="Libellé Crédit")
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    date_ecriture = models.DateField()
    libelle = models.CharField(max_length=300, verbose_name="Libellé de l'écriture")

    class Meta:
        ordering = ['-date_ecriture']
        verbose_name = "Écriture Comptable"

    def __str__(self):
        return f"D:{self.compte_debit} / C:{self.compte_credit} = {self.montant} MRU"
