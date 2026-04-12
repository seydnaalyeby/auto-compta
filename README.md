# Auto-Compta 🇲🇷
### Comptabilité intelligente pour les PME mauritaniennes

Application web/desktop de comptabilité automatisée basée sur l'IA (Gemini),
conforme au **Plan Comptable Bancaire Mauritanien (BCM 1988)**.

---

## 🚀 Fonctionnalités

- **Saisie en langage naturel** : Écrivez en français → L'IA génère les écritures comptables
- **4 documents automatiques** : Trésorerie · Compte de résultat · Bilan · Journal
- **Correction d'erreurs IA** : Envoyez une photo de votre bilan → L'IA détecte les erreurs
- **Conforme PCM Mauritanien** : Utilise les 9 classes du Plan Comptable BCM 1988
- **Multi-entreprises** : Chaque entreprise a son propre espace sécurisé

---

## 📋 Prérequis

Installez ces outils sur Windows avant de commencer :

| Outil | Lien | Version |
|-------|------|---------|
| Python | https://python.org/downloads | 3.11+ |
| Node.js | https://nodejs.org | 18 LTS+ |
| PostgreSQL | https://postgresql.org/download/windows | 15+ |

> ⚠️ Pendant l'installation de Python, cochez **"Add Python to PATH"**

---

## ⚙️ Installation — Étape par Étape

### 1️⃣ Cloner / Extraire le projet

```
Extrayez le ZIP dans un dossier, par exemple : C:\auto_compta
```

### 2️⃣ Créer la base de données PostgreSQL

Ouvrez **pgAdmin** (installé avec PostgreSQL) ou le terminal et créez une base :

```sql
CREATE DATABASE auto_compta_db;
```

### 3️⃣ Configurer le Backend Django

Ouvrez un terminal (CMD) dans le dossier `backend` :

```cmd
cd C:\auto_compta\backend
```

Créez l'environnement virtuel Python :

```cmd
python -m venv venv
venv\Scripts\activate
```

Installez les dépendances :

```cmd
pip install -r requirements.txt
```

Créez le fichier `.env` (copiez `.env.example`) :

```cmd
copy .env.example .env
```

Ouvrez `.env` avec Notepad et remplissez :

```
SECRET_KEY=une-cle-secrete-longue-ici
DEBUG=True
DB_NAME=auto_compta_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
DB_HOST=localhost
DB_PORT=5432
GEMINI_API_KEY=votre_cle_gemini
```

> 🔑 Obtenez votre clé Gemini gratuite sur : https://aistudio.google.com

Appliquez les migrations :

```cmd
python manage.py makemigrations
python manage.py migrate
```

Créez un super utilisateur admin (optionnel) :

```cmd
python manage.py createsuperuser
```

Lancez le serveur backend :

```cmd
python manage.py runserver
```

> ✅ Le backend tourne sur : http://localhost:8000

### 4️⃣ Configurer le Frontend Web

Ouvrez un **nouveau** terminal dans le dossier `web` :

```cmd
cd C:\auto_compta\web
npm install
npm start
```

> ✅ L'application s'ouvre automatiquement sur : http://localhost:3000

### 5️⃣ Configurer l'Application Mobile (Flutter)

Ouvrez un **nouveau** terminal dans le dossier `Mobile` :

```cmd
cd C:\auto_compta\Mobile
flutter pub get
flutter run
```

> ✅ L'application mobile s'ouvre sur votre appareil ou émulateur
> Pour le web : `flutter run -d chrome`

---

## 🖥️ Version Desktop (Electron)

Pour transformer l'app en logiciel installable sur Windows :

```cmd
cd C:\auto_compta\web
npm install electron electron-builder --save-dev
npm run build
npx electron-builder --win
```

Le fichier `.exe` installable sera créé dans `web/dist/`

---

## 📁 Structure du Projet

```
auto_compta/
├── backend/                    ← Django REST API
│   ├── apps/
│   │   ├── auth_app/           ← Authentification JWT
│   │   ├── operations/         ← Saisie des opérations
│   │   ├── comptabilite/       ← Trésorerie, Bilan, Résultat
│   │   └── ia/                 ← Module IA (Gemini)
│   ├── config/                 ← Settings Django
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── web/                        ← React Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/            ← Connexion / Inscription
│   │   │   ├── Dashboard/       ← Tableau de bord
│   │   │   ├── Saisie/          ← Saisie IA
│   │   │   ├── Tresorerie/      ← Trésorerie + graphiques
│   │   │   ├── Resultat/        ← Compte de résultat
│   │   │   ├── Bilan/           ← Bilan comptable
│   │   │   ├── Journal/         ← Journal des écritures
│   │   │   └── Correction/      ← Correction IA (photo)
│   │   ├── services/api.js      ← Appels API
│   │   ├── context/AuthContext  ← Authentification
│   │   └── App.js               ← Routing principal
│   └── package.json
│
├── Mobile/                      ← Flutter Mobile Application
│   ├── lib/
│   │   ├── screens/
│   │   │   ├── auth_screen.dart     ← Écran d'authentification
│   │   │   ├── dashboard_screen.dart ← Tableau de bord mobile
│   │   │   └── ...               ← Autres écrans
│   │   ├── services/
│   │   │   ├── api_service.dart     ← Services API mobile
│   │   │   └── auth_service.dart    ← Authentification mobile
│   │   ├── models/
│   │   │   ├── user.dart           ← Modèle utilisateur
│   │   │   └── operation.dart     ← Modèle opération
│   │   └── main.dart              ← Point d'entrée Flutter
│   ├── pubspec.yaml              ← Dépendances Flutter
│   └── build/                    ← Build Flutter
│
└── shared/                      ← Shared Resources
    ├── docs/                    ← Documentation
    ├── assets/                   ← Images, logos, etc.
    └── api-specs/                ← API specifications
```

---

## 🔌 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/inscription/` | Créer un compte |
| POST | `/api/auth/connexion/` | Se connecter |
| POST | `/api/operations/saisir/` | Saisir une opération (IA) |
| GET  | `/api/operations/` | Lister les opérations |
| GET  | `/api/operations/ecritures/` | Journal des écritures |
| GET  | `/api/comptabilite/tresorerie/` | Trésorerie |
| GET  | `/api/comptabilite/compte-resultat/` | Compte de résultat |
| GET  | `/api/comptabilite/bilan/` | Bilan |
| GET  | `/api/comptabilite/dashboard/` | Dashboard |
| POST | `/api/ia/corriger-image/` | Corriger une image |
| POST | `/api/ia/corriger-texte/` | Corriger un texte |

---

## 🏦 Plan Comptable Mauritanien (PCM BCM 1988)

L'application utilise les règles officielles du Plan Comptable Bancaire de la
Banque Centrale de Mauritanie (Lettre Circulaire N°007/GR/88) :

| Classe | Description | Comptes principaux |
|--------|-------------|-------------------|
| 1 | Trésorerie & Opérations interbancaires | 10=Caisse, 12=Banque |
| 2 | Opérations avec la clientèle | 20=Crédits, 21=Comptes clients |
| 3 | Autres comptes financiers | 320=Fournisseurs, 322=Personnel |
| 4 | Valeurs immobilisées | 42=Immobilisations corporelles |
| 5 | Capitaux permanents | 59=Capital, 58=Réserves |
| 6 | Charges | 620=Loyers, 650=Salaires, 66=Impôts |
| 7 | Produits | 702=Ventes, 71=Produits accessoires |
| 8 | Résultats | 82=Résultat exploitation, 87=Résultat net |
| 9 | Hors-bilan | Engagements, garanties |

---

## 🛠️ Technologies utilisées

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend Web | React.js | 18 |
| Frontend Mobile | Flutter | 3.x |
| Graphiques | Recharts | 2.x |
| Backend | Django REST Framework | 4.x |
| Auth | JWT (Simple JWT) | 5.x |
| Base de données | PostgreSQL | 15 |
| IA | Google Gemini API | Flash 1.5 |
| Desktop | Electron.js | (optionnel) |

---

## ❓ Problèmes fréquents

**"ModuleNotFoundError: No module named 'psycopg2'"**
```cmd
pip install psycopg2-binary
```

**"CORS error" dans le navigateur**
→ Vérifiez que le backend Django tourne bien sur le port 8000

**"Gemini API error"**
→ Vérifiez votre clé GEMINI_API_KEY dans le fichier .env

**"La base de données n'existe pas"**
→ Créez-la dans pgAdmin : `CREATE DATABASE auto_compta_db;`

---

## 📞 Support

Projet développé pour les PME mauritaniennes.
Conforme au Plan Comptable Bancaire Mauritanien (BCM 1988).
