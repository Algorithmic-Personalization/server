#!/bin/bash

echo "stopping containers"
docker-compose down
echo "starting containers again"
docker-compose up -d development-db adminer
echo "running yarn dev"
yarn dev
