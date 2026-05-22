#!/bin/bash
set -e
cd "$(dirname "$0")"

# PRODUCTION
git reset --hard
git checkout master
git pull origin master

npm i yarn -g
yarn global add serve
yarn
yarn run build
pm2 delete BOOKON-REACT 2>/dev/null || true
pm2 start ecosystem.config.cjs
