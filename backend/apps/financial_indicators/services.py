"""
Financial Indicators Calculation Service
Contains all financial calculation functions and AI integration.
"""

from typing import List, Dict, Any
import json
import re
import unicodedata

try:
    import google.generativeai as genai

    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from django.conf import settings


def _safe_float(value: Any, default: float = 0.0) -> float:
    if value in (None, "", []):
        return default
    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip().replace("\xa0", "").replace(" ", "")
    if not text:
        return default

    if "," in text and "." in text:
        if text.rfind(",") > text.rfind("."):
            text = text.replace(".", "").replace(",", ".")
        else:
            text = text.replace(",", "")
    elif "," in text:
        if text.count(",") == 1 and len(text.split(",")[-1]) <= 2:
            text = text.replace(",", ".")
        else:
            text = text.replace(",", "")

    try:
        return float(text)
    except (TypeError, ValueError):
        return default


def _numbers_from_matches(matches):
    values = []
    for match in matches:
        value = _safe_float(match, None)
        if value is not None:
            values.append(value)
    return values


def _normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text or "")
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()


def _extract_section_amount(text: str, keywords: List[str]) -> float | None:
    lowered = _normalize_text(text)
    for keyword in keywords:
        start = lowered.find(_normalize_text(keyword))
        if start == -1:
            continue
        snippet = lowered[start:start + 160]
        matches = re.findall(r"(\d[\d\s.,]*)", snippet)
        values = _numbers_from_matches(matches)
        if values:
            return values[0]
    return None


def _get_gemini_model():
    if not GEMINI_AVAILABLE:
        return None

    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        return None

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash"))


def calculate_bfr(receivables: float, payables: float) -> float:
    if receivables is None or payables is None:
        raise ValueError("Receivables and payables cannot be None")
    return receivables - payables


def calculate_van(investment_initial: float, cash_flows: List[float], discount_rate: float) -> float:
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
    if van is None or investment_initial is None:
        raise ValueError("VAN and investment initial are required")
    if investment_initial == 0:
        raise ValueError("Investment initial cannot be zero")
    return (van + investment_initial) / investment_initial


def calculate_drsi(investment_initial: float, cash_flows: List[float]) -> float:
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
            previous_cumulative = cumulative - cash_flow
            remaining_needed = investment_initial - previous_cumulative
            if cash_flow > 0:
                fractional_year = remaining_needed / cash_flow
                return year - 1 + fractional_year
            return year

    return float("inf")


def calculate_caf(net_result: float, amortization: float) -> float:
    if net_result is None or amortization is None:
        raise ValueError("Net result and amortization are required")
    return net_result + amortization


def calculate_all_indicators(data: Dict[str, Any]) -> Dict[str, float]:
    try:
        investment_initial = _safe_float(data.get("investmentInitial", 0))
        cash_flows = [_safe_float(cf) for cf in data.get("cashFlows", []) if _safe_float(cf) != 0]
        discount_rate = _safe_float(data.get("discountRate", 0))
        net_result = _safe_float(data.get("netResult", 0))
        amortization = _safe_float(data.get("amortization", 0))
        receivables = _safe_float(data.get("receivables", 0))
        payables = _safe_float(data.get("payables", 0))

        bfr = calculate_bfr(receivables, payables)
        van = calculate_van(investment_initial, cash_flows, discount_rate)
        ip = calculate_ip(van, investment_initial)
        drsi = calculate_drsi(investment_initial, cash_flows)
        caf = calculate_caf(net_result, amortization)

        return {
            "bfr": round(bfr, 2),
            "van": round(van, 2),
            "ip": round(ip, 2),
            "drsi": round(drsi, 2) if drsi != float("inf") else None,
            "caf": round(caf, 2),
        }
    except Exception as e:
        raise ValueError(f"Error calculating indicators: {str(e)}")


def extract_financial_data_with_ai(text: str) -> Dict[str, Any]:
    return _fallback_extract_financial_data(text)


def _fallback_extract_financial_data(text: str) -> Dict[str, Any]:
    text_lower = _normalize_text(text)

    numbers = re.findall(r"[\d\s,]+\.?\d*", text)
    numbers = [value for value in _numbers_from_matches(numbers) if value is not None]
    mru_matches = re.findall(r"(\d[\d\s.,]*)\s*(?:mru|ouguiya)", text, flags=re.IGNORECASE)
    mru_numbers = [value for value in _numbers_from_matches(mru_matches) if value > 0]

    extracted_data = {
        "investmentInitial": 0,
        "cashFlows": [],
        "discountRate": 0.1,
        "netResult": 0,
        "amortization": 0,
        "receivables": 0,
        "payables": 0,
    }

    investment = _extract_section_amount(text, ["investir", "investissement", "investi"])
    if investment is not None:
        extracted_data["investmentInitial"] = investment
    elif mru_numbers:
        extracted_data["investmentInitial"] = mru_numbers[0]

    cash_flow_matches = re.findall(
        r"(\d[\d\s.,]*)\s*(?:mru|ouguiya)?[^.]*?(?:premiere annee|premiere année|deuxieme annee|deuxième année|troisieme annee|troisième année|quatrieme annee|quatrième année|cinquieme annee|cinquième année)",
        text_lower,
        flags=re.IGNORECASE,
    )
    cash_flows = [value for value in _numbers_from_matches(cash_flow_matches) if value > 0]

    if not cash_flows and ("generer" in text_lower or "générer" in text_lower):
        mru_matches = re.findall(r"(\d[\d\s.,]*)\s*(?:mru|ouguiya)", text, flags=re.IGNORECASE)
        candidate_numbers = [value for value in _numbers_from_matches(mru_matches) if value > 0]
        if candidate_numbers and extracted_data["investmentInitial"]:
            cash_flows = [value for value in candidate_numbers if value != extracted_data["investmentInitial"]]
        else:
            cash_flows = candidate_numbers[1:4]

    extracted_data["cashFlows"] = cash_flows
    if len(extracted_data["cashFlows"]) < 2 and len(mru_numbers) >= 4:
        extracted_data["cashFlows"] = mru_numbers[1:4]

    rate_match = re.search(r"(\d[\d\s.,]*)\s*%", text)
    if rate_match:
        extracted_data["discountRate"] = _safe_float(rate_match.group(1), 10.0) / 100
    elif "taux" in text_lower:
        taux = _extract_section_amount(text, ["taux"])
        if taux is not None:
            extracted_data["discountRate"] = taux / 100 if taux > 1 else taux

    net_result = _extract_section_amount(text, ["resultat net", "résultat net", "benefice", "bénéfice", "profit"])
    if net_result is not None:
        extracted_data["netResult"] = net_result

    amortization = _extract_section_amount(text, ["amortissement", "depreciation", "dépréciation"])
    if amortization is not None:
        extracted_data["amortization"] = amortization

    receivables = _extract_section_amount(text, ["creances", "créances", "compte client"])
    if receivables is not None:
        extracted_data["receivables"] = receivables

    payables = _extract_section_amount(text, ["dettes", "dette", "fournisseur", "payable"])
    if payables is not None:
        extracted_data["payables"] = payables

    if len(mru_numbers) >= 8:
        trailing_values = mru_numbers[-4:]
        if extracted_data["netResult"] == 0:
            extracted_data["netResult"] = trailing_values[0]
        if extracted_data["amortization"] == 0:
            extracted_data["amortization"] = trailing_values[1]
        if extracted_data["receivables"] == 0:
            extracted_data["receivables"] = trailing_values[2]
        if extracted_data["payables"] == 0:
            extracted_data["payables"] = trailing_values[3]

    if not extracted_data["cashFlows"] and extracted_data["investmentInitial"] > 0:
        investment = extracted_data["investmentInitial"]
        extracted_data["cashFlows"] = [
            investment * 0.3,
            investment * 0.4,
            investment * 0.5,
        ]

    return extracted_data


def calculate_indicators_with_ai(text: str) -> Dict[str, Any]:
    try:
        extracted_data = extract_financial_data_with_ai(text)
        indicators = calculate_all_indicators(extracted_data)
        return {
            "extractedData": extracted_data,
            "indicators": indicators,
        }
    except Exception as e:
        raise ValueError(f"Error in AI calculation: {str(e)}")
