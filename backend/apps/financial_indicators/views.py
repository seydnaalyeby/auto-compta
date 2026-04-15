"""
Financial Indicators API Views
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services import calculate_all_indicators, calculate_indicators_with_ai


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_financial_indicators(request):
    """
    Calculate financial indicators
    POST /api/financial-indicators/calculate
    
    Request body:
    {
        "investmentInitial": number,
        "cashFlows": number[],
        "discountRate": number,
        "netResult": number,
        "amortization": number,
        "receivables": number,
        "payables": number
    }
    
    Response:
    {
        "bfr": number,
        "van": number,
        "ip": number,
        "drsi": number,
        "caf": number
    }
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['investmentInitial', 'cashFlows', 'discountRate', 
                        'netResult', 'amortization', 'receivables', 'payables']
        
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate cash flows is not empty
        if not data['cashFlows'] or len(data['cashFlows']) == 0:
            return Response(
                {'error': 'Cash flows cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate numeric values
        try:
            for field in ['investmentInitial', 'discountRate', 'netResult', 
                        'amortization', 'receivables', 'payables']:
                data[field] = float(data[field])
            
            data['cashFlows'] = [float(cf) for cf in data['cashFlows']]
        except (ValueError, TypeError):
            return Response(
                {'error': 'All numeric fields must be valid numbers'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate indicators
        result = calculate_all_indicators(data)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_financial_indicators_ai(request):
    """
    Calculate financial indicators using AI to extract data from text
    POST /api/financial-indicators/calculate-ai
    
    Request body:
    {
        "text": "Description textuelle du projet financier"
    }
    
    Response:
    {
        "extractedData": {
            "investmentInitial": number,
            "cashFlows": number[],
            "discountRate": number,
            "netResult": number,
            "amortization": number,
            "receivables": number,
            "payables": number
        },
        "indicators": {
            "bfr": number,
            "van": number,
            "ip": number,
            "drsi": number,
            "caf": number
        }
    }
    """
    try:
        data = request.data
        
        # Validate required field
        if 'text' not in data or not data['text'].strip():
            return Response(
                {'error': 'Text field is required and cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        text = data['text'].strip()
        
        # Calculate indicators using AI
        result = calculate_indicators_with_ai(text)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
