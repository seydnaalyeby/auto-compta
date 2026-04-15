"""
Financial Indicators Calculation Service - FIXED VERSION
Contains all financial calculation functions and AI integration
"""

from typing import List, Dict, Any
import math
import json
import re
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


def calculate_bfr(receivables: float, payables: float) -> float:
    """
    Calculate BFR (Besoin en Fonds de Roulement)
    BFR = receivables - payables
    """
    if receivables is None or payables is None:
        raise ValueError("Receivables and payables cannot be None")
    
    return receivables - payables


def calculate_van(investment_initial: float, cash_flows: List[float], discount_rate: float) -> float:
    """
    Calculate VAN (Valeur Actuelle Nette)
    VAN = -investmentInitial + Σ(cashFlow / (1 + rate)^t)
    """
    if investment_initial is None or cash_flows is None or discount_rate is None:
        raise ValueError("All parameters are required")
    
    if not cash_flows:
        raise ValueError("Cash flows list cannot be empty")
    
    if discount_rate == -1:
        raise ValueError("Discount rate cannot be -1")
    
    van = -investment_initial
    for t, cash_flow in enumerate(cash_flows, start=1):
        van += cash_flow / ((1 + discount_rate) ** t)
    
    return van


def calculate_ip(van: float, investment_initial: float) -> float:
    """
    Calculate IP (Indice de Profitabilité)
    IP = (van + investmentInitial) / investmentInitial
    """
    if van is None or investment_initial is None:
        raise ValueError("VAN and investment initial are required")
    
    if investment_initial == 0:
        raise ValueError("Investment initial cannot be zero")
    
    return (van + investment_initial) / investment_initial


def calculate_drsi(investment_initial: float, cash_flows: List[float]) -> float:
    """
    Calculate DRSI (Délai de Récupération sur Investissement)
    Iterate cumulative cashFlows until >= investmentInitial
    Return year index (or fractional year if possible)
    """
    if investment_initial is None or cash_flows is None:
        raise ValueError("Investment initial and cash flows are required")
    
    if not cash_flows:
        raise ValueError("Cash flows list cannot be empty")
    
    if investment_initial <= 0:
        raise ValueError("Investment initial must be positive")
    
    cumulative = 0
    for year, cash_flow in enumerate(cash_flows, start=1):
        cumulative += cash_flow
        if cumulative >= investment_initial:
            # Calculate fractional year if possible
            previous_cumulative = cumulative - cash_flow
            remaining_needed = investment_initial - previous_cumulative
            if cash_flow > 0:
                fractional_year = remaining_needed / cash_flow
                return year - 1 + fractional_year
            else:
                return year
    
    # If never reaches investment initial
    return float('inf')


def calculate_caf(net_result: float, amortization: float) -> float:
    """
    Calculate CAF (Capacité d'Autofinancement)
    CAF = netResult + amortization
    """
    if net_result is None or amortization is None:
        raise ValueError("Net result and amortization are required")
    
    return net_result + amortization


def calculate_all_indicators(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate all financial indicators from input data
    """
    try:
        # Extract data from input
        investment_initial = float(data.get('investmentInitial', 0))
        cash_flows = [float(cf) for cf in data.get('cashFlows', [])]
        discount_rate = float(data.get('discountRate', 0))
        net_result = float(data.get('netResult', 0))
        amortization = float(data.get('amortization', 0))
        receivables = float(data.get('receivables', 0))
        payables = float(data.get('payables', 0))
        
        # Calculate all indicators
        bfr = calculate_bfr(receivables, payables)
        van = calculate_van(investment_initial, cash_flows, discount_rate)
        ip = calculate_ip(van, investment_initial)
        drsi = calculate_drsi(investment_initial, cash_flows)
        caf = calculate_caf(net_result, amortization)
        
        return {
            'bfr': round(bfr, 2),
            'van': round(van, 2),
            'ip': round(ip, 2),
            'drsi': round(drsi, 2) if drsi != float('inf') else float('inf'),
            'caf': round(caf, 2)
        }
    
    except Exception as e:
        raise ValueError(f"Error calculating indicators: {str(e)}")


def extract_financial_data_with_ai(text: str) -> Dict[str, Any]:
    """
    Use AI to extract financial data from natural language text
    """
    if not GEMINI_AVAILABLE:
        return _fallback_extract_financial_data(text)
    
    try:
        # Configure Gemini API
        genai.configure(api_key="AIzaSyBj2k8f9v3X7w4Y1z6A5b8c9d0e1f2g3h4i5")
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        En tant qu'expert comptable, analyse ce texte et extrais les données financières suivantes:
        
        Texte: "{text}"
        
        Retourne UNIQUEMENT un JSON avec cette structure exacte:
        {{
            "investmentInitial": nombre,
            "cashFlows": [nombre1, nombre2, ...],
            "discountRate": nombre (en décimal, ex: 0.1 pour 10%),
            "netResult": nombre,
            "amortization": nombre,
            "receivables": nombre,
            "payables": nombre
        }}
        
        Si une valeur n'est pas mentionnée, utilise 0.
        Les montants doivent être en nombres (pas de texte).
        """
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            extracted_data = json.loads(json_match.group())
            
            # Validate and clean data
            return {
                'investmentInitial': float(extracted_data.get('investmentInitial', 0)),
                'cashFlows': [float(cf) for cf in extracted_data.get('cashFlows', []) if cf > 0],
                'discountRate': float(extracted_data.get('discountRate', 0.1)),
                'netResult': float(extracted_data.get('netResult', 0)),
                'amortization': float(extracted_data.get('amortization', 0)),
                'receivables': float(extracted_data.get('receivables', 0)),
                'payables': float(extracted_data.get('payables', 0))
            }
        else:
            return _fallback_extract_financial_data(text)
            
    except Exception as e:
        # Fallback to rule-based extraction if AI fails
        return _fallback_extract_financial_data(text)


def _fallback_extract_financial_data(text: str) -> Dict[str, Any]:
    """
    Fallback rule-based extraction when AI is not available - FIXED VERSION
    """
    text_lower = text.lower()
    
    # Extract numbers from text
    numbers = re.findall(r'[\d,]+\.?\d*', text)
    numbers = [float(num.replace(',', '')) for num in numbers]
    
    # Default values
    extracted_data = {
        'investmentInitial': 0,
        'cashFlows': [],
        'discountRate': 0.1,
        'netResult': 0,
        'amortization': 0,
        'receivables': 0,
        'payables': 0
    }
    
    # Rule-based extraction based on keywords
    if 'investissement' in text_lower or 'investi' in text_lower:
        for i, num in enumerate(numbers):
            if num > 1000:  # Assume investment is a significant amount
                extracted_data['investmentInitial'] = num
                break
    
    # FIXED: Better cash flows extraction
    if 'flux' in text_lower or 'cash flow' in text_lower or 'revenu' in text_lower or 'année' in text_lower:
        # Extract cash flows (look for multiple amounts)
        cash_flows = [num for num in numbers if 1000 <= num <= 100000]
        # Remove investment amount from cash flows if it's included
        if extracted_data['investmentInitial'] in cash_flows:
            cash_flows.remove(extracted_data['investmentInitial'])
        
        if len(cash_flows) > 1:
            extracted_data['cashFlows'] = cash_flows[:5]  # Limit to 5 years
        elif len(cash_flows) == 1:
            extracted_data['cashFlows'] = [cash_flows[0]]
    
    if 'taux' in text_lower or '%' in text:
        for num in numbers:
            if num < 1:  # Discount rate is usually < 1
                extracted_data['discountRate'] = num
                break
        # If no rate < 1 found, look for percentage
        if extracted_data['discountRate'] == 0.1:
            for num in numbers:
                if num > 1 and num < 100:  # Percentage like 10
                    extracted_data['discountRate'] = num / 100
                    break
    
    if 'résultat' in text_lower or 'bénéfice' in text_lower or 'profit' in text_lower:
        for num in numbers:
            if 10000 <= num <= 1000000:  # Reasonable profit range
                extracted_data['netResult'] = num
                break
    
    if 'amortissement' in text_lower or 'dépréciation' in text_lower:
        for num in numbers:
            if 1000 <= num <= 100000:  # Reasonable amortization range
                extracted_data['amortization'] = num
                break
    
    if 'créance' in text_lower or 'compte client' in text_lower:
        for num in numbers:
            if 10000 <= num <= 500000:  # Reasonable receivables range
                extracted_data['receivables'] = num
                break
    
    if 'dette' in text_lower or 'fournisseur' in text_lower or 'payable' in text_lower:
        for num in numbers:
            if 10000 <= num <= 500000:  # Reasonable payables range
                extracted_data['payables'] = num
                break
    
    # If no cash flows found, create default ones based on investment
    if not extracted_data['cashFlows'] and extracted_data['investmentInitial'] > 0:
        investment = extracted_data['investmentInitial']
        # Create 3 years of cash flows (30%, 40%, 50% of investment)
        extracted_data['cashFlows'] = [
            investment * 0.3,
            investment * 0.4,
            investment * 0.5
        ]
    
    return extracted_data


def calculate_indicators_with_ai(text: str) -> Dict[str, Any]:
    """
    Extract financial data with AI and calculate indicators
    """
    try:
        # Extract data using AI
        extracted_data = extract_financial_data_with_ai(text)
        
        # Calculate indicators
        indicators = calculate_all_indicators(extracted_data)
        
        return {
            'extractedData': extracted_data,
            'indicators': indicators
        }
        
    except Exception as e:
        raise ValueError(f"Error in AI calculation: {str(e)}")
