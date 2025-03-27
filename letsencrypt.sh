#!/bin/bash
cd /home/ubuntu/Deployment/
docker-compose run --rm certbot renew
docker container restart deployment-uat-nginx-1