#!/bin/sh

: "${PORT:=8000}"

# Start Gunicorn with more verbose logging and write access/error logs to stdout
exec gunicorn bouano.wsgi \
	--workers 2 \
	--bind 0.0.0.0:$PORT \
	--log-level debug \
	--access-logfile - \
	--error-logfile -
