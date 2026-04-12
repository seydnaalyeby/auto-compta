from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal
from apps.operations.models import Operation, EcritureComptable


def get_operations_user(user, mois=None, annee=None):
    ops = Operation.objects.filter(utilisateur=user)
    if annee:
        ops = ops.filter(date_operation__year=annee)
    if mois:
        ops = ops.filter(date_operation__month=mois)
    return ops


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tresorerie(request):
    """
    Trésorerie = argent disponible en caisse + banque
    Mise à jour en temps réel à chaque opération
    """
    annee = request.query_params.get('annee', timezone.now().year)
    mois = request.query_params.get('mois')

    ops = get_operations_user(request.user, mois, annee)

    # Calcul caisse (espèces)
    entrees_caisse = ops.filter(
        type_operation__in=['vente', 'encaissement'],
        moyen_paiement='caisse'
    ).aggregate(total=Sum('montant'))['total'] or Decimal('0')

    sorties_caisse = ops.filter(
        type_operation__in=['achat', 'paiement', 'salaire', 'loyer', 'impot'],
        moyen_paiement='caisse'
    ).aggregate(total=Sum('montant'))['total'] or Decimal('0')

    # Calcul banque
    entrees_banque = ops.filter(
        type_operation__in=['vente', 'encaissement'],
        moyen_paiement__in=['banque', 'cheque']
    ).aggregate(total=Sum('montant'))['total'] or Decimal('0')

    sorties_banque = ops.filter(
        type_operation__in=['achat', 'paiement', 'salaire', 'loyer', 'impot'],
        moyen_paiement__in=['banque', 'cheque']
    ).aggregate(total=Sum('montant'))['total'] or Decimal('0')

    solde_caisse = entrees_caisse - sorties_caisse
    solde_banque = entrees_banque - sorties_banque
    total = solde_caisse + solde_banque

    # Historique par mois pour graphique
    from django.db.models.functions import TruncMonth
    historique = Operation.objects.filter(
        utilisateur=request.user,
        date_operation__year=annee
    ).annotate(mois=TruncMonth('date_operation')).values('mois').annotate(
        entrees=Sum('montant', filter=Q(type_operation__in=['vente', 'encaissement'])),
        sorties=Sum('montant', filter=Q(type_operation__in=['achat', 'paiement', 'salaire', 'loyer', 'impot']))
    ).order_by('mois')

    return Response({
        'caisse': float(solde_caisse),
        'banque': float(solde_banque),
        'total': float(total),
        'entrees_caisse': float(entrees_caisse),
        'sorties_caisse': float(sorties_caisse),
        'entrees_banque': float(entrees_banque),
        'sorties_banque': float(sorties_banque),
        'historique': list(historique),
        'alerte': total < 0,
        'periode': {'annee': annee, 'mois': mois}
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compte_resultat(request):
    """
    Compte de Résultat = Produits (gains) - Charges (dépenses)
    Selon Plan Comptable Mauritanien:
    - Produits: Classe 7 (70=ventes, 71=produits accessoires, 74=produits divers)
    - Charges: Classe 6 (60=charges exploitation, 62=loyer, 65=salaires, 66=impôts)
    """
    annee = request.query_params.get('annee', timezone.now().year)
    mois = request.query_params.get('mois')

    ops = get_operations_user(request.user, mois, annee)

    # PRODUITS (Classe 7 PCM)
    ventes = ops.filter(type_operation='vente').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    encaissements = ops.filter(type_operation='encaissement').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    total_produits = ventes + encaissements

    # CHARGES (Classe 6 PCM)
    achats = ops.filter(type_operation='achat').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    salaires = ops.filter(type_operation='salaire').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    loyers = ops.filter(type_operation='loyer').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    impots = ops.filter(type_operation='impot').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    paiements = ops.filter(type_operation='paiement').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    total_charges = achats + salaires + loyers + impots + paiements

    resultat_net = total_produits - total_charges

    return Response({
        'produits': {
            'ventes': float(ventes),
            'encaissements': float(encaissements),
            'total': float(total_produits)
        },
        'charges': {
            'achats': float(achats),
            'salaires': float(salaires),
            'loyers': float(loyers),
            'impots': float(impots),
            'autres_paiements': float(paiements),
            'total': float(total_charges)
        },
        'resultat_net': float(resultat_net),
        'est_benefice': resultat_net > 0,
        'periode': {'annee': annee, 'mois': mois}
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bilan(request):
    """
    Bilan = Photo complète à une date précise
    ACTIF = ce qu'on possède (Classe 1 trésorerie + stock + immobilisations)
    PASSIF = d'où vient ce qu'on possède (capital + dettes)
    RÈGLE: ACTIF = PASSIF toujours
    Selon Plan Comptable Mauritanien BCM 1988
    """
    annee = request.query_params.get('annee', timezone.now().year)
    mois = request.query_params.get('mois', timezone.now().month)

    # Toutes les opérations jusqu'à cette date
    ops_all = Operation.objects.filter(
        utilisateur=request.user,
        date_operation__year__lte=annee,
    )
    if mois:
        ops_all = ops_all.filter(date_operation__month__lte=mois)

    # ── ACTIF (Ce que l'entreprise possède) ──────────────────────────────
    # Classe 1 PCM: Trésorerie
    caisse_entrees = ops_all.filter(
        type_operation__in=['vente', 'encaissement'],
        moyen_paiement='caisse'
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')
    caisse_sorties = ops_all.filter(
        type_operation__in=['achat', 'paiement', 'salaire', 'loyer', 'impot'],
        moyen_paiement='caisse'
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')
    caisse = caisse_entrees - caisse_sorties

    banque_entrees = ops_all.filter(
        type_operation__in=['vente', 'encaissement'],
        moyen_paiement__in=['banque', 'cheque']
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')
    banque_sorties = ops_all.filter(
        type_operation__in=['achat', 'paiement', 'salaire', 'loyer', 'impot'],
        moyen_paiement__in=['banque', 'cheque']
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')
    banque = banque_entrees - banque_sorties

    tresorerie_total = caisse + banque

    # Créances clients (ventes à crédit non encore encaissées)
    creances_clients = ops_all.filter(
        type_operation='vente',
        moyen_paiement='credit'
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')

    total_actif = tresorerie_total + creances_clients

    # ── PASSIF (D'où vient ce qu'on possède) ────────────────────────────
    # Dettes fournisseurs (achats à crédit non encore payés)
    dettes_fournisseurs = ops_all.filter(
        type_operation='achat',
        moyen_paiement='credit'
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')

    # Loyer dû (non encore payé)
    loyer_du = ops_all.filter(
        type_operation='loyer',
        moyen_paiement='credit'
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')

    total_dettes = dettes_fournisseurs + loyer_du

    # Capital = Actif - Dettes
    capital = total_actif - total_dettes

    total_passif = capital + total_dettes

    return Response({
        'actif': {
            'tresorerie': {
                'caisse': float(caisse),        # Compte 100 PCM
                'banque': float(banque),         # Compte 12 PCM
                'total': float(tresorerie_total)
            },
            'creances_clients': float(creances_clients),  # Compte 210 PCM
            'total_actif': float(total_actif)
        },
        'passif': {
            'capital': float(capital),           # Compte 59 PCM
            'dettes': {
                'fournisseurs': float(dettes_fournisseurs),  # Compte 320 PCM
                'loyer_du': float(loyer_du),
                'total': float(total_dettes)
            },
            'total_passif': float(total_passif)
        },
        'equilibre': abs(total_actif - total_passif) < Decimal('0.01'),
        'periode': {'annee': annee, 'mois': mois}
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Données complètes pour le tableau de bord"""
    annee = timezone.now().year
    mois = timezone.now().month

    ops_mois = get_operations_user(request.user, mois, annee)
    ops_all = get_operations_user(request.user)

    total_operations = ops_all.count()
    operations_ce_mois = ops_mois.count()

    ventes_mois = ops_mois.filter(type_operation='vente').aggregate(
        t=Sum('montant'))['t'] or Decimal('0')
    depenses_mois = ops_mois.filter(
        type_operation__in=['achat', 'salaire', 'loyer', 'impot', 'paiement']
    ).aggregate(t=Sum('montant'))['t'] or Decimal('0')

    # 5 dernières opérations
    from apps.operations.serializers import OperationSerializer
    dernieres_ops = OperationSerializer(
        ops_all.order_by('-date_creation')[:5], many=True
    ).data

    return Response({
        'stats': {
            'total_operations': total_operations,
            'operations_ce_mois': operations_ce_mois,
            'ventes_mois': float(ventes_mois),
            'depenses_mois': float(depenses_mois),
            'resultat_mois': float(ventes_mois - depenses_mois),
        },
        'dernieres_operations': dernieres_ops,
        'periode': {'annee': annee, 'mois': mois}
    })
