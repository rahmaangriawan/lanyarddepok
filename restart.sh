#!/usr/bin/env bash
set -euo pipefail

if [ -d "$HOME/.nvm" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi

APP_NAME="${APP_NAME:-lanyarddepok.com}"
APP_PORT="${APP_PORT:-3006}"
REMOTE_PATH="${REMOTE_PATH:-htdocs/lanyarddepok.com}"

if [ -d "$HOME/$REMOTE_PATH" ]; then
  APP_DIR="$HOME/$REMOTE_PATH"
elif [ -d "$REMOTE_PATH" ]; then
  APP_DIR="$REMOTE_PATH"
else
  APP_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

cd "$APP_DIR"
export PORT="$APP_PORT"
export NODE_ENV=production

echo "=== Restarting Astro frontend ==="
echo "Application directory: $APP_DIR"
echo "Application name: $APP_NAME"
echo "Application port: $APP_PORT"

if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
  else
    pm2 start apps/frontend/dist/server/entry.mjs --name "$APP_NAME" --cwd "$APP_DIR" --update-env
  fi
  pm2 save >/dev/null 2>&1 || true
else
  pkill -f "apps/frontend/dist/server/entry.mjs" || true
  nohup node apps/frontend/dist/server/entry.mjs > astro.log 2>&1 &
fi

echo "Astro frontend restarted."
