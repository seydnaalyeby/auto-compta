import base64
import json
import re
import unicodedata
from decimal import Decimal, InvalidOperation

import google.generativeai as genai
from django.conf import settings


PLAN_COMPTABLE_MAURITANIEN = """
PLAN COMPTABLE BANCAIRE MAURITANIEN (BCM 1988)

Comptes utiles:
- 100 = Caisse
- 12 = Banque
- 210 = Compte client
- 320 = Fournisseurs
- 420 = Immobilisations d'exploitation
- 590 = Capital social
- 620 = Loyers
- 630 = Charges externes
- 650 = Salaires
- 660 = Impots
- 702 = Produits des operations avec la clientele

Regles de base:
- Vente au comptant: debit 100 / credit 702
- Vente par banque: debit 12 / credit 702
- Vente a credit: debit 210 / credit 702
- Encaissement client: debit 100 ou 12 / credit 210
- Achat a credit: debit compte concerne / credit 320
- Loyer paye: debit 620 / credit 100 ou 12
- Salaire paye: debit 650 / credit 100 ou 12
- Impot paye: debit 660 / credit 100 ou 12
"""


PROMPT_ANALYSE = """
Tu es un expert-comptable specialise dans le Plan Comptable Bancaire Mauritanien.
Analyse l'operation suivante et retourne uniquement un JSON valide.

Regles:
{plan_comptable}

Texte: "{texte}"

Priorites obligatoires:
- Le montant doit reprendre exactement la valeur visible dans le texte.
- Le moyen de paiement doit respecter le texte: "especes" => caisse, "banque/virement" => banque, "cheque" => cheque, "credit/a credit" => credit.
- "vendu/vente" => type_operation "vente"
- "achete/achat" => type_operation "achat"
- "loyer" => type_operation "loyer"
- "salaire" => type_operation "salaire"
- "impot/taxe" => type_operation "impot"
- "recu/encaisse" => type_operation "encaissement"
- N'invente ni montant ni moyen de paiement.

Retour attendu:
{{
  "succes": true,
  "type_operation": "vente|achat|paiement|encaissement|salaire|loyer|impot|autre",
  "description": "Description courte",
  "montant": 0.0,
  "moyen_paiement": "caisse|banque|cheque|credit",
  "categorie": "Categorie",
  "compte_debit": "100",
  "libelle_debit": "Nom compte debit",
  "compte_credit": "702",
  "libelle_credit": "Nom compte credit",
  "explication": "Explication simple",
  "questions": []
}}

Si des informations sont insuffisantes, retourne:
{{
  "succes": false,
  "erreur": "information_manquante",
  "questions": ["Question 1"]
}}
"""


PROMPT_CORRECTION = """
Tu es un expert-comptable specialise dans le Plan Comptable Bancaire Mauritanien.
Analyse le document ci-dessous et retourne uniquement un JSON valide.

Regles:
{plan_comptable}

Contenu:
{contenu}

Retour attendu:
{{
  "document_type": "bilan|compte_resultat|journal|autre",
  "est_equilibre": true,
  "total_actif": 0,
  "total_passif": 0,
  "total_debit": 0,
  "total_credit": 0,
  "erreurs": [],
  "avertissements": [],
  "resume": "Resume"
}}
"""


PAYMENT_KEYWORDS = {
    "credit": ["a credit", "au credit", "a terme", "non paye", "non payee", "creance"],
    "caisse": ["espece", "especes", "cash", "caisse"],
    "cheque": ["cheque", "cheques"],
    "banque": ["banque", "virement", "versement bancaire", "carte", "wave", "bankily"],
}

TYPE_KEYWORDS = [
    ("loyer", ["loyer", "location"]),
    ("encaissement", ["encaisse", "encaissement", "recu paiement", "reglement client", "recu client"]),
    ("salaire", ["salaire", "salaires", "paye employe", "versement employe"]),
    ("impot", ["impot", "impots", "taxe", "taxes", "tva"]),
    ("vente", ["vendu", "vente", "vendre", "vendues", "vendus"]),
    ("achat", ["achat", "achete", "achetee", "achetes", "acheter", "approvisionnement", "stock"]),
    ("paiement", ["paye", "paye", "payer", "regle", "reglement", "depense", "depenses"]),
]

TYPE_CATEGORIES = {
    "vente": "Ventes",
    "achat": "Achats",
    "encaissement": "Encaissements",
    "paiement": "Charges",
    "loyer": "Charges locatives",
    "salaire": "Charges de personnel",
    "impot": "Impots et taxes",
    "autre": "Divers",
}

TYPE_DESCRIPTIONS = {
    "vente": "Vente enregistree",
    "achat": "Achat enregistre",
    "encaissement": "Encaissement enregistre",
    "paiement": "Paiement enregistre",
    "loyer": "Paiement de loyer",
    "salaire": "Paiement de salaire",
    "impot": "Paiement d'impot",
    "autre": "Operation diverse",
}


def _get_gemini_model():
    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        return None

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash"))


def _strip_markdown_json(text):
    cleaned = text.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```", 1)[1].split("```", 1)[0].strip()
    return cleaned


def _normalize_text(text):
    normalized = unicodedata.normalize("NFKD", text or "")
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()


def _decimal_from_string(value):
    cleaned = (value or "").strip().replace("\xa0", "").replace(" ", "")
    if not cleaned:
        return None

    if "," in cleaned and "." in cleaned:
        if cleaned.rfind(",") > cleaned.rfind("."):
            cleaned = cleaned.replace(".", "").replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        if cleaned.count(",") == 1 and len(cleaned.split(",")[-1]) <= 2:
            cleaned = cleaned.replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")
    elif "." in cleaned and cleaned.count(".") > 1:
        cleaned = cleaned.replace(".", "")

    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def _extract_amount(texte):
    currency_pattern = re.compile(r"(\d[\d\s.,]*)\s*(mru|mrus|ouguiya|ouguiyas|um)\b", re.IGNORECASE)
    generic_pattern = re.compile(r"(?<!\d)(\d[\d\s.,]*)(?!\d)")

    currency_matches = [match.group(1) for match in currency_pattern.finditer(texte or "")]
    for candidate in reversed(currency_matches):
        amount = _decimal_from_string(candidate)
        if amount and amount > 0:
            return amount

    generic_amounts = []
    for match in generic_pattern.finditer(texte or ""):
        amount = _decimal_from_string(match.group(1))
        if amount and amount >= 100:
            generic_amounts.append(amount)
    if generic_amounts:
        return max(generic_amounts)

    return None


def _detect_payment_method(texte, fallback="caisse"):
    normalized = _normalize_text(texte)
    for payment_method in ("credit", "caisse", "cheque", "banque"):
        if any(_contains_keyword(normalized, keyword) for keyword in PAYMENT_KEYWORDS[payment_method]):
            return payment_method

    fallback = (fallback or "").strip().lower()
    if fallback in {"caisse", "banque", "cheque", "credit"}:
        return fallback
    return "caisse"


def _detect_operation_type(texte, fallback="autre"):
    normalized = _normalize_text(texte)
    for operation_type, keywords in TYPE_KEYWORDS:
        if any(_contains_keyword(normalized, keyword) for keyword in keywords):
            return operation_type

    fallback = (fallback or "").strip().lower()
    if fallback in TYPE_CATEGORIES:
        return fallback
    return "autre"


def _build_accounts(operation_type, payment_method):
    payment_account = {
        "caisse": ("100", "Caisse"),
        "banque": ("12", "Banque"),
        "cheque": ("12", "Banque"),
        "credit": ("210", "Compte client"),
    }

    if operation_type == "vente":
        debit = payment_account[payment_method]
        return debit[0], debit[1], "702", "Produits des operations avec la clientele"

    if operation_type == "encaissement":
        debit = payment_account["caisse" if payment_method == "credit" else payment_method]
        return debit[0], debit[1], "210", "Compte client"

    if operation_type == "achat":
        credit = ("320", "Fournisseurs") if payment_method == "credit" else payment_account[payment_method]
        return "600", "Achats de marchandises", credit[0], credit[1]

    if operation_type == "loyer":
        credit = ("320", "Fournisseurs") if payment_method == "credit" else payment_account[payment_method]
        return "620", "Loyers", credit[0], credit[1]

    if operation_type == "salaire":
        credit = payment_account["banque" if payment_method == "credit" else payment_method]
        return "650", "Salaires", credit[0], credit[1]

    if operation_type == "impot":
        credit = payment_account["banque" if payment_method == "credit" else payment_method]
        return "660", "Impots", credit[0], credit[1]

    if operation_type == "paiement":
        credit = payment_account["banque" if payment_method == "credit" else payment_method]
        return "630", "Charges externes", credit[0], credit[1]

    debit = payment_account["caisse" if payment_method == "credit" else payment_method]
    return debit[0], debit[1], "702", "Produits des operations avec la clientele"


def _contains_keyword(text, keyword):
    pattern = r"(?<!\w)" + re.escape(keyword) + r"(?!\w)"
    return re.search(pattern, text) is not None


def normaliser_analyse_operation(texte, analyse=None):
    analyse = analyse or {}
    amount = _extract_amount(texte)
    operation_type = _detect_operation_type(texte, analyse.get("type_operation", "autre"))
    payment_method = _detect_payment_method(texte, analyse.get("moyen_paiement", "caisse"))

    if amount is None:
        raw_amount = analyse.get("montant")
        amount = _decimal_from_string(str(raw_amount)) if raw_amount not in (None, "") else Decimal("0")
    if not amount or amount <= 0:
        return {
            "succes": False,
            "erreur": "information_manquante",
            "questions": ["Quel est le montant exact de l'operation ?"],
        }

    compte_debit, libelle_debit, compte_credit, libelle_credit = _build_accounts(
        operation_type,
        payment_method,
    )

    description = (analyse.get("description") or "").strip()
    if not description or description.lower() in {"operation diverse", "vente de produits", "achat de fournitures"}:
        description = TYPE_DESCRIPTIONS[operation_type]

    return {
        "succes": True,
        "type_operation": operation_type,
        "description": description,
        "montant": float(amount),
        "moyen_paiement": payment_method,
        "categorie": analyse.get("categorie") or TYPE_CATEGORIES[operation_type],
        "compte_debit": compte_debit,
        "libelle_debit": libelle_debit,
        "compte_credit": compte_credit,
        "libelle_credit": libelle_credit,
        "explication": analyse.get("explication")
        or "Analyse verifiee a partir du texte saisi pour conserver le montant, le type et le moyen de paiement exacts.",
        "questions": analyse.get("questions", []),
    }


def analyser_operation(texte: str) -> dict:
    if not texte or not texte.strip():
        return {"succes": False, "erreur": "Aucun texte fourni", "questions": []}

    try:
        model = _get_gemini_model()
        if model is None:
            return _fallback_analysis(texte)

        prompt = PROMPT_ANALYSE.format(
            plan_comptable=PLAN_COMPTABLE_MAURITANIEN,
            texte=texte,
        )
        response = model.generate_content(prompt)
        resultat = json.loads(_strip_markdown_json(response.text))
        return normaliser_analyse_operation(texte, resultat)
    except Exception:
        return _fallback_analysis(texte)


def _fallback_analysis(texte):
    return normaliser_analyse_operation(
        texte,
        {
            "succes": True,
            "type_operation": "autre",
            "description": "",
            "montant": 0,
            "moyen_paiement": "caisse",
            "categorie": "",
            "questions": [],
        },
    )


def corriger_document(contenu_texte: str = None, image_base64: str = None) -> dict:
    try:
        model = _get_gemini_model()
        if model is None:
            return {
                "erreur": "Aucune cle Gemini configuree.",
                "erreurs": [],
            }

        if image_base64:
            image_data = base64.b64decode(image_base64)
            prompt = PROMPT_CORRECTION.format(
                plan_comptable=PLAN_COMPTABLE_MAURITANIEN,
                contenu="[Image du document comptable]",
            )
            response = model.generate_content(
                [prompt, {"mime_type": "image/jpeg", "data": image_data}]
            )
        else:
            prompt = PROMPT_CORRECTION.format(
                plan_comptable=PLAN_COMPTABLE_MAURITANIEN,
                contenu=contenu_texte or "",
            )
            response = model.generate_content(prompt)

        return json.loads(_strip_markdown_json(response.text))
    except Exception as exc:
        return {"erreur": str(exc), "erreurs": []}
