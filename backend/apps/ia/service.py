import google.generativeai as genai
import json
import base64
from django.conf import settings

# Configuration Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# ── Plan Comptable Mauritanien BCM 1988 ──────────────────────────────────────
PLAN_COMPTABLE_MAURITANIEN = """
PLAN COMPTABLE BANCAIRE MAURITANIEN (BCM 1988) - RÈGLES D'ENREGISTREMENT

CLASSE 1 - TRÉSORERIE:
  10 = Caisse (espèces en main)
    100 = Billets et monnaies
  11 = Institut d'émission, Trésor Public, CCP
  12 = Établissements de crédit
  
CLASSE 2 - OPÉRATIONS CLIENTÈLE:
  20 = Crédits à la clientèle
  21 = Comptes de la clientèle (210=comptes ordinaires)
  22 = Créances restructurées
  23 = Créances immobilisées
  24 = Créances douteuses ou litigieuses
  26 = Bons de caisse

CLASSE 3 - AUTRES COMPTES FINANCIERS:
  30 = Chèques à recouvrer
  31 = Comptes d'encaissement
  32 = Débiteurs et Créditeurs divers
    320 = Fournisseurs
    322 = Personnel
    323 = État et collectivités publiques
    324 = Sécurité sociale
    325 = Actionnaires
    326 = Autres tiers
  35 = Comptes de régularisation
  38 = Titres de placement

CLASSE 4 - VALEURS IMMOBILISÉES:
  40 = Titres de participation
  42 = Immobilisations corporelles
    420 = Immobilisations d'exploitation
    4204 = Matériel d'exploitation
    4205 = Matériel de transport
    4206 = Matériel bureau et informatique
  47 = Frais et valeurs incorporelles
  48 = Amortissements des immobilisations

CLASSE 5 - CAPITAUX PERMANENTS:
  52 = Provisions pour risques et charges
  56 = Résultat net en attente d'affectation
  58 = Réserves
  59 = Capital
    590 = Capital social

CLASSE 6 - CHARGES:
  60 = Charges d'exploitation bancaire
  62 = Charges externes liées à l'investissement
    620 = Locations et charges locatives (LOYER)
  63 = Charges externes liées à l'activité
    630 = Transports
    632 = Frais postaux et télécommunications
    633 = Honoraires
    634 = Publicité
    638 = Charges diverses
  64 = Charges et pertes diverses
  65 = Frais de personnel
    650 = Rémunérations du personnel (SALAIRES)
    652 = Charges sociales
  66 = Impôts, taxes et versements assimilés
    660 = Impôts directs
    661 = Taxes et impôts indirects
  68 = Dotations aux amortissements et provisions

CLASSE 7 - PRODUITS:
  70 = Produits d'exploitation bancaire
    702 = Produits des opérations avec la clientèle (VENTES)
    706 = Produits des opérations diverses
  71 = Produits accessoires
    711 = Revenus des immeubles
    712 = Prestations de services
  74 = Produits et profits divers
  78 = Reprises sur amortissements et provisions

CLASSE 8 - RÉSULTATS:
  82 = Résultats d'exploitation
  85 = Résultat net avant impôt
  86 = Impôt sur le résultat
  87 = Résultat net de la période

RÈGLES DE BASE:
- VENTE au comptant (espèces): DÉBIT 100 (Caisse) / CRÉDIT 702 (Produits ventes)
- VENTE par banque/virement: DÉBIT 12 (Banque) / CRÉDIT 702 (Produits ventes)  
- VENTE à crédit (non payé): DÉBIT 210 (Compte client) / CRÉDIT 702 (Produits ventes)
- ACHAT au comptant (espèces): DÉBIT 320 (Fournisseur) ou compte stock / CRÉDIT 100 (Caisse)
- ACHAT par banque: DÉBIT compte concerné / CRÉDIT 12 (Banque)
- ACHAT à crédit: DÉBIT compte concerné / CRÉDIT 320 (Fournisseurs)
- LOYER payé espèces: DÉBIT 620 (Loyers) / CRÉDIT 100 (Caisse)
- LOYER payé banque: DÉBIT 620 (Loyers) / CRÉDIT 12 (Banque)
- LOYER dû non payé: DÉBIT 620 (Loyers) / CRÉDIT 320 (Fournisseurs/Propriétaire)
- SALAIRE payé: DÉBIT 650 (Salaires) / CRÉDIT 100 (Caisse) ou 12 (Banque)
- IMPÔT payé: DÉBIT 660 (Impôts) / CRÉDIT 100 (Caisse) ou 12 (Banque)
- ACHAT matériel: DÉBIT 42 (Immobilisations) / CRÉDIT 100 ou 12
"""

PROMPT_ANALYSE = """
Tu es un expert-comptable spécialisé dans le Plan Comptable Bancaire Mauritanien (BCM 1988).
L'utilisateur va te donner une opération en langage naturel (français ou arabe).
Tu dois analyser cette opération et retourner UNIQUEMENT un objet JSON valide.

Règles du Plan Comptable Mauritanien à utiliser:
{plan_comptable}

Texte de l'utilisateur: "{texte}"

Retourne UNIQUEMENT ce JSON (sans explication, sans markdown):
{{
  "succes": true,
  "type_operation": "vente|achat|paiement|encaissement|salaire|loyer|impot|autre",
  "description": "Description courte et claire de l'opération",
  "montant": 0.00,
  "moyen_paiement": "caisse|banque|cheque|credit",
  "categorie": "Catégorie du produit/service",
  "compte_debit": "code compte PCM ex: 100",
  "libelle_debit": "Nom du compte débité",
  "compte_credit": "code compte PCM ex: 702",
  "libelle_credit": "Nom du compte crédité",
  "explication": "Explication simple pourquoi ces comptes",
  "questions": []
}}

Si des informations manquent (montant, moyen paiement), retourne:
{{
  "succes": false,
  "erreur": "information_manquante",
  "questions": ["Question 1 à poser à l'utilisateur", "Question 2..."]
}}
"""

PROMPT_CORRECTION = """
Tu es un expert-comptable spécialisé dans le Plan Comptable Bancaire Mauritanien (BCM 1988).
On te donne une image ou un texte d'un document comptable (bilan, compte de résultat, journal).
Tu dois analyser ce document et détecter toutes les erreurs comptables.

Règles du Plan Comptable Mauritanien:
{plan_comptable}

Document à analyser:
{contenu}

Retourne UNIQUEMENT ce JSON:
{{
  "document_type": "bilan|compte_resultat|journal|autre",
  "est_equilibre": true/false,
  "total_actif": 0,
  "total_passif": 0,
  "total_debit": 0,
  "total_credit": 0,
  "erreurs": [
    {{
      "ligne": "Description de la ligne problématique",
      "type_erreur": "desequilibre|mauvais_compte|montant_incorrect|autre",
      "description": "Explication claire de l'erreur",
      "correction_suggeree": "Comment corriger cette erreur"
    }}
  ],
  "avertissements": ["avertissement 1", "avertissement 2"],
  "resume": "Résumé général de l'état du document"
}}
"""


def analyser_operation(texte: str) -> dict:
    """Analyse un texte en langage naturel et retourne les données comptables"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = PROMPT_ANALYSE.format(
            plan_comptable=PLAN_COMPTABLE_MAURITANIEN,
            texte=texte
        )
        response = model.generate_content(prompt)
        texte_reponse = response.text.strip()

        # Nettoyer la réponse (enlever markdown si présent)
        if '```json' in texte_reponse:
            texte_reponse = texte_reponse.split('```json')[1].split('```')[0].strip()
        elif '```' in texte_reponse:
            texte_reponse = texte_reponse.split('```')[1].split('```')[0].strip()

        resultat = json.loads(texte_reponse)
        return resultat

    except json.JSONDecodeError:
        return {
            'succes': False,
            'erreur': 'Réponse IA invalide - réessayez',
            'questions': []
        }
    except Exception as e:
        return {
            'succes': False,
            'erreur': str(e),
            'questions': []
        }


def corriger_document(contenu_texte: str = None, image_base64: str = None) -> dict:
    """Analyse un document comptable (texte ou image) et détecte les erreurs"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')

        if image_base64:
            # Analyse d'une image
            image_data = base64.b64decode(image_base64)
            prompt = PROMPT_CORRECTION.format(
                plan_comptable=PLAN_COMPTABLE_MAURITANIEN,
                contenu="[Image du document comptable ci-jointe]"
            )
            response = model.generate_content([
                prompt,
                {"mime_type": "image/jpeg", "data": image_data}
            ])
        else:
            # Analyse d'un texte
            prompt = PROMPT_CORRECTION.format(
                plan_comptable=PLAN_COMPTABLE_MAURITANIEN,
                contenu=contenu_texte
            )
            response = model.generate_content(prompt)

        texte_reponse = response.text.strip()
        if '```json' in texte_reponse:
            texte_reponse = texte_reponse.split('```json')[1].split('```')[0].strip()
        elif '```' in texte_reponse:
            texte_reponse = texte_reponse.split('```')[1].split('```')[0].strip()

        return json.loads(texte_reponse)

    except Exception as e:
        return {'erreur': str(e), 'erreurs': []}
