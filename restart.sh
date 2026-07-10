#!/usr/bin/env bash
set -euo pipefail

if [ -d "$HOME/.nvm" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi

APP_NAME="${APP_NAME:-lanyarddepok.com}"
APP_PORT="${APP_PORT:-3007}"
REMOTE_PATH="${REMOTE_PATH:-htdocs/lanyarddepok.com}"

if [ -d "$HOME/$REMOTE_PATH" ]; then
  BASE_DIR="$HOME/$REMOTE_PATH"
elif [ -d "$REMOTE_PATH" ]; then
  BASE_DIR="$REMOTE_PATH"
else
  BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

if [ -d "$BASE_DIR/current" ]; then
  APP_DIR="$BASE_DIR/current"
else
  APP_DIR="$BASE_DIR"
fi

cd "$APP_DIR"
export PORT="$APP_PORT"
export HOST="127.0.0.1"
export NODE_ENV=production

echo "=== Restarting Astro frontend ==="
echo "Application directory: $APP_DIR"
echo "Application name: $APP_NAME"
echo "Application port: $APP_PORT"

if command -v pm2 >/dev/null 2>&1; then
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start "$APP_DIR/apps/frontend/dist/server/entry.mjs" --name "$APP_NAME" --cwd "$APP_DIR" --update-env
  pm2 save >/dev/null 2>&1 || true
else
  PID_FILE="$BASE_DIR/astro.pid"
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    kill "$(cat "$PID_FILE")"
  fi
  nohup node "$APP_DIR/apps/frontend/dist/server/entry.mjs" > "$BASE_DIR/astro.log" 2>&1 &
  echo $! > "$PID_FILE"
fi

echo "Astro frontend restarted."
