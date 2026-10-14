#!/bin/bash
# Production deploy (server: /root/bookon-react1, Docker container bookon-frontend on :3000)
# Rollback: docker tag bookon-react1-bookon-frontend:rollback bookon-react1-bookon-frontend:latest && docker compose up -d bookon-frontend
set -e
cd "$(dirname "$0")"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree has local changes, aborting (commit or stash them first)."
  git status --short
  exit 1
fi

git fetch origin
git checkout -B master origin/master
echo "Deploying $(git log --oneline -1)"

docker tag bookon-react1-bookon-frontend:latest bookon-react1-bookon-frontend:rollback 2>/dev/null || true

docker compose build bookon-frontend
docker compose up -d bookon-frontend
docker ps --filter name=bookon-frontend --format '{{.Names}} {{.Status}}'
