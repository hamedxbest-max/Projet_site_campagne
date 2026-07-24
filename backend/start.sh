#!/bin/sh

: "${PORT:=8000}"

# Start Gunicorn via python -m to avoid path issues when the gunicorn script is not available
exec python -m gunicorn bouano.wsgi \
	--error-logfile -
