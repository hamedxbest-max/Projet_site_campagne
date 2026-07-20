# BOUAN'O DOUMAINTANG — Site de levée de fonds (ASSERES)

Site en 11 étapes pour la campagne de santé BOUAN'O DOUMAINTANG (16–23 août 2026),
avec paiement Campay (Orange Money / MTN Mobile Money) et espace admin pour suivre
les contributions et exporter les données en Excel.

## Structure du projet

```
bouano-doumaintang/
├── frontend/          React (Vite) — les 11 pages + espace admin (/admin-dashboard)
└── backend/           Django REST Framework — API, base de données, Campay, export Excel
```

## 1. Lancer le frontend en local

```bash
cd frontend
npm install
cp .env.example .env      # ajuster VITE_API_BASE_URL si besoin
npm run dev
```
Le site est disponible sur http://localhost:5173
L'espace admin (React) est sur http://localhost:5173/admin-dashboard

## 2. Lancer le backend en local

Prérequis : Python 3.11+, PostgreSQL installé et démarré.

```bash
cd backend
python -m venv venv
source venv/bin/activate        # sous Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # renseigner DB_*, CAMPAY_*, etc.

# créer la base de données PostgreSQL
createdb bouano_doumaintang

python manage.py migrate
python manage.py createsuperuser   # compte utilisé pour se connecter à /admin-dashboard
python manage.py runserver
```
L'API tourne sur http://localhost:8000/api
L'admin Django natif (secours) est sur http://localhost:8000/admin/

## 3. Configurer Campay

1. Créer un compte sur https://www.campay.net
2. Récupérer `CAMPAY_USERNAME` et `CAMPAY_PASSWORD` (identifiants API) dans le
   tableau de bord Campay et les mettre dans `backend/.env`
3. En test, garder `CAMPAY_BASE_URL=https://demo.campay.net/api` (sandbox)
4. En production, passer à `CAMPAY_BASE_URL=https://www.campay.net/api`
5. Dans le tableau de bord Campay, configurer l'URL de webhook :
   `https://votredomaine.cm/api/webhook/campay/`
   — c'est ce qui permet de confirmer les paiements même si l'utilisateur
   ferme son navigateur avant la fin.

Le montant minimum de contribution (20 000 FCFA) est appliqué à la fois côté
frontend (message d'erreur immédiat) et côté backend (`MINIMUM_CONTRIBUTION_AMOUNT`
dans `.env`), donc impossible à contourner même en modifiant le frontend.

## 4. Espace admin

Deux façons d'accéder aux données :

- **Dashboard sur-mesure** (`/admin-dashboard` côté frontend) : liste filtrable
  des contributions, statistiques rapides, bouton "Exporter en Excel".
  Connexion avec le compte créé via `createsuperuser`.
- **Django Admin natif** (`/admin/` côté backend) : solution de secours, avec
  une action "Exporter la sélection en fichier Excel" dans la liste des
  contributions.

## 5. Déploiement (proposition)

- **Backend + base de données** : un VPS (ex. Contabo, Hostinger VPS) ou un
  service comme Railway/Render, avec PostgreSQL managé
- **Frontend** : Vercel ou Netlify (build `npm run build`, dossier `dist/`),
  ou servi directement par le même VPS avec Nginx
- Ne jamais commiter le fichier `.env` (déjà exclu via `.gitignore`)
- Utiliser `DEBUG=False` et un vrai `DJANGO_SECRET_KEY` en production

## Ce qui reste à compléter

- Logos des 10 établissements partenaires (page 3) — emplacements déjà prévus
- Photos des « grands porteurs » (pages 7 et 8) — cadres déjà prévus
- Clés Campay réelles (sandbox puis production)
- Lien exact du formulaire d'enregistrement des bénévoles (actuellement un
  message de confirmation ; à connecter dès que le lien est fourni)
