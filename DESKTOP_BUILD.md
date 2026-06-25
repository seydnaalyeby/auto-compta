# Auto Compta Desktop Build

Cette version garde PostgreSQL pour le developpement web, et ajoute un mode desktop avec SQLite pour un installateur Windows.

## Ce qui a ete prepare

- `backend/config/settings.py`
  - `DB_ENGINE=postgresql` pour la version web actuelle
  - `DB_ENGINE=sqlite` pour la version desktop
- `backend/desktop_launcher.py`
  - cree le dossier local de donnees
  - applique les migrations SQLite automatiquement
  - lance Django sur `127.0.0.1:8000`
- `backend/config/urls.py`
  - sert le build React depuis Django pour la version desktop
- `web/electron/main.js`
  - lance le backend local
  - ouvre l'application dans une fenetre Electron

## Flux recommande

1. Continuer le developpement web avec PostgreSQL.
2. Quand vous voulez preparer la version Windows, construire React.
3. Construire l'executable backend Windows.
4. Construire l'installateur Electron Windows.

## 1. Version web actuelle

Utilisez votre `.env` normal :

```env
APP_MODE=web
DB_ENGINE=postgresql
```

## 2. Construire le frontend React

```powershell
cd web
npm run desktop:react
```

## 3. Construire l'executable backend

Installez PyInstaller une fois dans votre environnement Python :

```powershell
pip install pyinstaller
```

Puis depuis la racine du projet :

```powershell
pyinstaller --noconfirm --onedir --name auto-compta-backend backend/desktop_launcher.py
```

Le resultat attendu sera dans :

```text
backend/dist/auto-compta-backend/
```

## 4. Construire l'installateur Windows

Installez les dependances Node desktop :

```powershell
cd web
npm install
```

Puis construisez l'installateur :

```powershell
npm run desktop:build
```

Le resultat attendu sera dans :

```text
web/electron/dist/
```

## Donnees utilisateur

En mode desktop, SQLite est cree ici :

```text
C:\Users\<nom>\AppData\Local\AutoCompta\data\auto_compta.sqlite3
```

Chaque personne qui installe l'application aura donc sa propre base locale.

## Important

- Gemini a toujours besoin d'internet.
- Si vous voulez une version vraiment hors ligne, il faudra remplacer Gemini par un modele local.
- Je n'ai pas telecharge `electron`, `electron-builder` ou `pyinstaller` ici, donc l'installateur final n'a pas encore ete genere dans cette session.
