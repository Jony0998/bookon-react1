#!/bin/bash
# Production deploy (server: /root/bookon-react1, Docker container bookon-frontend on 127.0.0.1:3000)
# Builds origin/master, starts it, checks that the page answers and rolls back by itself otherwise.
# Manual rollback: docker tag bookon-react1-bookon-frontend:rollback bookon-react1-bookon-frontend:latest && docker compose up -d bookon-frontend
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

healthy() {
  curl -fsS --max-time 5 http://127.0.0.1:3000/ 2>/dev/null | grep -q '<div id="root">'
}

for i in $(seq 1 20); do
  if healthy; then break; fi
  sleep 2
done

if ! healthy; then
  echo "New version does NOT serve the app after 40 s — rolling back."
  docker logs --tail 30 bookon-frontend || true
  if docker image inspect bookon-react1-bookon-frontend:rollback >/dev/null 2>&1; then
    docker tag bookon-react1-bookon-frontend:rollback bookon-react1-bookon-frontend:latest
    docker compose up -d --no-build bookon-frontend
  fi
  exit 1
fi

docker ps --filter name=bookon-frontend --format '{{.Names}} {{.Status}}'
echo "Frontend is serving the app."
