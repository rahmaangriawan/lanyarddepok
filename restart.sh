#!/bin/bash
set -e

if [ -d "$HOME/.nvm" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi

for profile in "$HOME/.bash_profile" "$HOME/.bashrc" "$HOME/.profile"; do
  [ -f "$profile" ] && . "$profile"
done

APP_NAME="${APP_NAME:-lanyardbogor.com}"
PORT="${PORT:-3006}"
export PORT
export NODE_ENV=production

if [ -n "$REMOTE_PATH" ]; then
  if [ -d "$HOME/$REMOTE_PATH" ]; then
    cd "$HOME/$REMOTE_PATH"
  elif [ -d "$REMOTE_PATH" ]; then
    cd "$REMOTE_PATH"
  fi
elif [ -d "$HOME/htdocs/lanyardbogor.com" ]; then
  cd "$HOME/htdocs/lanyardbogor.com"
else
  cd "$(dirname "$0")"
fi

echo "=== Restarting Lanyard Bogor ==="
echo "Current directory: $(pwd)"
echo "App name: $APP_NAME"
echo "Port: $PORT"

if [ -f .env ]; then
  echo "Loading environment variables from .env..."
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
  export PORT="${PORT:-3006}"
fi

if command -v pm2 >/dev/null 2>&1; then
  echo "PM2 detected. Restarting $APP_NAME..."
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
  else
    pm2 start server.js --name "$APP_NAME" --update-env
  fi
  pm2 save >/dev/null 2>&1 || true
  echo "Application restarted with PM2."
else
  echo "PM2 not found. Starting node server.js directly..."
  pkill -f "node server.js" || true
  sleep 2
  nohup node server.js > node.log 2>&1 &
  sleep 1

  if pgrep -f "node server.js" >/dev/null; then
    echo "Application started in background. Logs: node.log"
  else
    echo "WARNING: Application failed to start. Last log lines:"
    tail -n 20 node.log || true
    exit 1
  fi
fi
