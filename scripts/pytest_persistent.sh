#!/bin/bash
cd /app/

/usr/local/bin/gunicorn3 --bind=0.0.0.0:8000 wsgi:application

