# Guide complet de déploiement (Gratuit) — BOUANE Ô DOUMAINTANG

Ce guide décrit pas à pas comment mettre en ligne le site (frontend Vite + backend Django) en utilisant des services gratuits (Vercel, Railway/Fly.io/Railway, Supabase, Cloudinary, Cloudflare). Il fournit les commandes, variables d'environnement et vérifications à effectuer. Suivez les sections dans l'ordre.

--

## 1. Choix de la stack gratuite recommandée
- Frontend (static) : Vercel (free) ou Netlify
- Backend (Django) : Railway / Fly.io / Render free tier (Railway recommandé pour facilité)
- Base de données : Supabase (Postgres free) ou Railway Postgres free credits
- Stockage médias (uploads) : Cloudinary (free) ou Supabase Storage
- DNS & TLS : Cloudflare (free)
- Remarque : Les offres free ont des limitations (mise en veille, quotas). Pour production stable, prévoir un plan payant.

## 2. Prérequis
- Compte GitHub (ou Git provider) contenant le repo.
- Comptes: Vercel, Railway (ou Fly.io), Supabase, Cloudinary (optionnel), Cloudflare (optionnel).
- Node.js et npm installés localement pour builder le frontend.
- Python 3.10+/venv local pour tests.

## 3. Préparer le code localement (vérifications rapides)
1. Frontend
   - Ouvrir `frontend/package.json` : vérifier script `build` (Vite). Exemple:
     ```json
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview --port 5173"
     }
     ```
   - Tester build local :
     ```bash
     cd frontend
     npm install
     npm run build
     npx serve dist    # ou npm i -g serve
     ```

2. Backend
   - Vérifier `backend/requirements.txt` contient `gunicorn`, `psycopg2-binary` (ou `psycopg[binary]`), `django-environ` si utilisé.
   - Key files to check: `backend/bouano/settings.py`, `backend/manage.py`, `backend/bouano/wsgi.py`.
   - Tester localement:
     ```bash
     cd backend
     python -m venv .venv
     .venv/Scripts/activate    # Windows
     pip install -r requirements.txt
     python manage.py migrate
     python manage.py runserver
     ```

## 4. Variables d'environnement à préparer
- `DJANGO_SECRET_KEY` : clé secrète Django
- `DEBUG=false`
- `ALLOWED_HOSTS` : backend host(s) (ex: `backend-xxxxx.up.railway.app`)
- `DATABASE_URL` : URL Postgres (Supabase/Railway)
- `TARAMONEY_API_KEY` : (si utilisé)
- `TARAMONEY_BUSINESS_ID`
- `TARAMONEY_BASE_URL`
- `TARAMONEY_DEFAULT_WEBHOOK` : URL publique `/api/payments/taramoney/webhook/`
- `CLOUDINARY_URL` or `SUPABASE_STORAGE_*` if using external media storage
- `VITE_API_BASE_URL` : (pour frontend build env) ex: `https://<backend-host>/api`

Note: Never commit secret values to Git.

## 5. Déploiement Frontend (Vercel)
1. Connecter le repo GitHub à Vercel.
2. Project settings:
   - Framework: "Vite"
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add Environment Variable (Production):
   - `VITE_API_BASE_URL` = `https://<backend-host>/api`
4. Déployer: Vercel build & publish. Copiez l'URL publique fournie.

## 6. Déploiement Backend (Railway guide)
1. Créer un nouveau projet sur Railway, connecter le repo backend.
2. Définir le service web et la commande de démarrage. Exemple `Procfile` (ajouter au repo):
   ```Procfile
   web: gunicorn bouano.wsgi --bind 0.0.0.0:$PORT --workers 2
   ```
3. Ajouter env vars dans Railway (Settings → Variables) listées en section 4.
4. Attacher une base de données (Supabase or Railway Postgres) et définir `DATABASE_URL`.
5. Déployer: Railway exécutera `pip install` et démarrera le service.

Alternative: utiliser Dockerfile si vous préférez déployer en conteneur.

## 7. Base de données (Supabase)
1. Créez un projet Supabase, récupérez les credetials (host, port, db, user, password).
2. Récupérez `DATABASE_URL` au format:
   `postgres://user:password@host:port/dbname`
3. Exécuter migrations sur le serveur (via Railway console ou CICD deploy step):
   ```bash
   python manage.py migrate
   python manage.py loaddata initial_data.json   # facultatif
   python manage.py createsuperuser
   ```

## 8. Stockage médias
- Option Cloudinary (simple): installez `django-cloudinary-storage` et configurez `DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'` et `CLOUDINARY_URL` env var.
- Option Supabase Storage: configurez `django-storages` compatible ou upload via API directement.
- Mettez à jour `backend/bouano/settings.py` pour pointer vers la solution choisie.

## 9. Webhooks Taramoney
- Taramoney nécessite une URL publique stable pour le webhook. Configurez `TARAMONEY_DEFAULT_WEBHOOK` à `https://<backend-host>/api/payments/taramoney/webhook/`.
- Quelques providers free (Railway) fournissent des URLs stables mais peuvent changer si vous supprimez le projet.

## 10. Domaine & DNS (Cloudflare)
1. Acheter un domaine si besoin.
2. Ajouter le domaine sur Vercel (frontend) et Railway (backend) si vous souhaitez custom domains pour les deux.
3. Dans Cloudflare, créez des `CNAME` ou `A` records selon instructions du provider. Activez le proxy Cloudflare (orange cloud) pour TLS et CDN.

## 11. collectstatic (Django static)
- Configurer `STATIC_ROOT` et appeler `python manage.py collectstatic` pendant le déploiement. Uploader les fichiers statiques sur S3/Cloudflare/CDN ou servez-les via Vercel static site if you copy them into frontend build.

## 12. Vérifications post-déploy
- Ouvrez l'URL frontend: vérifier pages, images, liens.
- Tester endpoint backend: `https://<backend-host>/api/health/` ou équivalent.
- Créer une contribution test, lancer paiement (si Taramoney sandbox disponible).
- Vérifier upload d'images et webhook de paiement.

## 13. Monitoring & backups gratuits
- UptimeRobot (free) pour checks.
- Supabase snapshots / Railway daily backups (free tier limited).

## 14. Checklist finale (à cocher avant mise en production)
- [ ] Env vars configurées et secrètes stockées.
- [ ] Base de données en place et migrations appliquées.
- [ ] `collectstatic` exécuté et médias accessibles.
- [ ] Frontend `VITE_API_BASE_URL` mis à jour.
- [ ] Webhook Taramoney configuré et testé.
- [ ] Domaine et TLS configurés.
- [ ] Tests manuels du flux de paiement effectués.

--

### Instructions pour générer un PDF (local)
Option A — si tu as `pandoc` installé:
```bash
# depuis la racine du projet
pandoc DEPLOYMENT_GUIDE.md -o DEPLOYMENT_GUIDE.pdf --pdf-engine=xelatex
```

Option B — via navigateur (simple):
1. Ouvre `DEPLOYMENT_GUIDE.md` dans VS Code et choisis "Open Preview".
2. Dans la preview, `Ctrl+P` (Print) ou `Export to PDF` via l'extension, puis enregistre en PDF.

Option C — convertir HTML -> PDF:
```bash
# générer HTML depuis markdown
pandoc DEPLOYMENT_GUIDE.md -o DEPLOYMENT_GUIDE.html
# ouvrir dans Chrome et imprimer en PDF
```

--

Si tu veux, je peux:
- ajouter un `Procfile` et un `Dockerfile` au repo,
- créer un fichier `deployment_env_example` listant toutes les env vars prêtes à remplir,
- ou générer directement le PDF si tu souhaites que j'essaie un convertisseur côté serveur (mais il faudra peut-être installer `pandoc` localement).

Dis-moi quelles actions tu veux que j'exécute maintenant (ajouter `Procfile`, `Dockerfile`, `deployment_env_example`, ou autre).