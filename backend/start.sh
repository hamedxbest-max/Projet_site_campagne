#!/bin/sh

: "${PORT:=8000}"

exec gunicorn bouano.wsgi --workers 2 --bind 0.0.0.0:$PORT
