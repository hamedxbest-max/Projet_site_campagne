#!/bin/sh

: "${PORT:=8000}"

mkdir -p media

python manage.py migrate --noinput

# Start Gunicorn via python -m to avoid path issues when the gunicorn script is not available
exec python -m gunicorn bouano.wsgi \
  --workers 2 \
  --bind 0.0.0.0:$PORT \
  --log-level debug \
  --access-logfile - \
  --error-logfile -
