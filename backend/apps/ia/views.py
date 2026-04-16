from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
import base64
from .service import corriger_document, analyser_operation
from apps.operations.models import Operation
from decimal import Decimal
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def corriger_image(request):
    """
    Reçoit une photo d'un document comptable
    et retourne les erreurs détectées par l'IA
    """
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'Aucune image fournie'}, status=400)

    # Convertir en base64
    image_data = base64.b64encode(image.read()).decode('utf-8')
    resultat = corriger_document(image_base64=image_data)
    return Response(resultat)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def corriger_texte(request):
    """
    Reçoit un texte d'un document comptable
    et retourne les erreurs détectées par l'IA
    """
    texte = request.data.get('texte', '')
    if not texte:
        return Response({'error': 'Aucun texte fourni'}, status=400)

    resultat = corriger_document(contenu_texte=texte)
    return Response(resultat)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def saisir_operation_ai(request):
    """
    Analyse une opération en langage naturel et la sauvegarde
    """
    print(f"DEBUG: saisir_operation_ai called")
    print(f"DEBUG: Request data: {request.data}")
    print(f"DEBUG: Request user: {request.user}")
    
    texte = request.data.get('texte', '')
    date_operation = request.data.get('date_operation', None)
    
    print(f"DEBUG: Extracted texte: '{texte}'")
    print(f"DEBUG: Extracted date_operation: '{date_operation}'")
    
    if not texte:
        print("DEBUG: No texte provided, returning 400 error")
        return Response({'error': 'Aucun texte fourni'}, status=400)

    print("DEBUG: Calling analyser_operation...")
    # Analyser l'opération avec l'IA
    analyse = analyser_operation(texte)
    print(f"DEBUG: Analysis result: {analyse}")
    
    if not analyse.get('succes', False):
        print("DEBUG: Analysis failed, returning error response")
        return Response({
            'succes': False,
            'erreur': analyse.get('erreur', 'Erreur d\'analyse'),
            'questions': analyse.get('questions', [])
        }, status=400)

    try:
        # Créer l'opération
        operation_date = timezone.now().date()
        if date_operation:
            try:
                from datetime import datetime
                operation_date = datetime.strptime(date_operation, '%Y-%m-%d').date()
            except ValueError:
                pass  # Keep current date if parsing fails
                
        operation = Operation.objects.create(
            utilisateur=request.user,
            type_operation=analyse['type_operation'],
            description=analyse['description'],
            montant=Decimal(str(analyse['montant'])),
            moyen_paiement=analyse['moyen_paiement'],
            categorie=analyse.get('categorie', ''),
            date_operation=operation_date,
            traitee_par_ia=True
        )

        return Response({
            'succes': True,
            'message': 'Opération enregistrée avec succès',
            'operation': {
                'id': operation.id,
                'type_operation': operation.type_operation,
                'description': operation.description,
                'montant': float(operation.montant),
                'moyen_paiement': operation.moyen_paiement,
                'categorie': operation.categorie,
                'date_operation': operation.date_operation.strftime('%Y-%m-%d'),
                'explication': analyse.get('explication', ''),
                'compte_debit': analyse.get('compte_debit', ''),
                'compte_credit': analyse.get('compte_credit', '')
            }
        })

    except Exception as e:
        return Response({
            'succes': False,
            'erreur': f'Erreur lors de l\'enregistrement: {str(e)}'
        }, status=500)
