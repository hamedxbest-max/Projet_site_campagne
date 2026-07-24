FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# dépendances système nécessaires (psycopg2, build tools)
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Copier requirements et l'installer
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel
RUN python -m pip install -r /app/requirements.txt

# Copier le code
COPY backend /app

# Collect static (ignore errors si settings pas encore complètes)
RUN python manage.py collectstatic --noinput || true

# Port (Railway injecte $PORT à l'exécution)
ENV PORT=8000

# Commande de démarrage
CMD ["sh", "-c", "gunicorn bouano.wsgi --workers 2 --bind 0.0.0.0:$PORT"]
