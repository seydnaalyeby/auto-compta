from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Operation, EcritureComptable
from .serializers import OperationSerializer, SaisieTexteSerializer, EcritureComptableSerializer
from apps.ia.service import analyser_operation

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def saisir_operation(request):
    """
    L'utilisateur envoie un texte en français/arabe
    L'IA analyse et crée automatiquement l'opération + les écritures comptables
    """
    serializer = SaisieTexteSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    texte = serializer.validated_data['texte']
    date_op = serializer.validated_data.get('date_operation', timezone.now().date())

    # Appel au module IA
    resultat_ia = analyser_operation(texte)

    if not resultat_ia.get('succes'):
        return Response({
            'error': 'Impossible d\'analyser cette opération',
            'detail': resultat_ia.get('erreur', '')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Créer l'opération
    operation = Operation.objects.create(
        utilisateur=request.user,
        texte_original=texte,
        type_operation=resultat_ia['type_operation'],
        description=resultat_ia['description'],
        montant=resultat_ia['montant'],
        moyen_paiement=resultat_ia['moyen_paiement'],
        categorie=resultat_ia.get('categorie', ''),
        date_operation=date_op,
        traitee_par_ia=True
    )

    # Créer l'écriture comptable
    EcritureComptable.objects.create(
        operation=operation,
        compte_debit=resultat_ia['compte_debit'],
        libelle_debit=resultat_ia['libelle_debit'],
        compte_credit=resultat_ia['compte_credit'],
        libelle_credit=resultat_ia['libelle_credit'],
        montant=resultat_ia['montant'],
        date_ecriture=date_op,
        libelle=resultat_ia['description']
    )

    return Response({
        'message': 'Opération enregistrée avec succès !',
        'operation': OperationSerializer(operation).data,
        'analyse_ia': resultat_ia
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_operations(request):
    operations = Operation.objects.filter(utilisateur=request.user)
    # Filtres optionnels
    type_op = request.query_params.get('type')
    mois = request.query_params.get('mois')
    annee = request.query_params.get('annee')

    if type_op:
        operations = operations.filter(type_operation=type_op)
    if mois:
        operations = operations.filter(date_operation__month=mois)
    if annee:
        operations = operations.filter(date_operation__year=annee)

    return Response(OperationSerializer(operations, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_ecritures(request):
    ecritures = EcritureComptable.objects.filter(
        operation__utilisateur=request.user
    )
    mois = request.query_params.get('mois')
    annee = request.query_params.get('annee')
    if mois:
        ecritures = ecritures.filter(date_ecriture__month=mois)
    if annee:
        ecritures = ecritures.filter(date_ecriture__year=annee)

    return Response(EcritureComptableSerializer(ecritures, many=True).data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_operation(request, pk):
    try:
        operation = Operation.objects.get(pk=pk, utilisateur=request.user)
        operation.delete()
        return Response({'message': 'Opération supprimée'})
    except Operation.DoesNotExist:
        return Response({'error': 'Opération non trouvée'}, status=404)
