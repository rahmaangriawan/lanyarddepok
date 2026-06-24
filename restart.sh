#!/bin/bash
# Navigate to the application directory
# Supports both jailed and absolute home directory layouts
if [ -d "$HOME/htdocs/jakartalanyard.com" ]; then
  cd "$HOME/htdocs/jakartalanyard.com"
elif [ -d "/home/mantap-jakarta/htdocs/jakartalanyard.com" ]; then
  cd "/home/mantap-jakarta/htdocs/jakartalanyard.com"
else
  cd "$(dirname "$0")"
fi

echo "=== Restarting Node.js App ==="
echo "Current directory: $(pwd)"

# Kill any existing process running server.js
echo "Stopping existing server.js processes..."
pkill -f "node server.js" || true
sleep 2

# Verify and export environment variables from .env if present
if [ -f .env ]; then
  echo "Loading environment variables from .env..."
  # Clean up Windows carriage returns if any
  export $(grep -v '^#' .env | sed 's/\r$//' | xargs)
fi

# Set default port to 3005 if not set in .env
export PORT=${PORT:-3005}
export NODE_ENV=production

# Start the server in the background
echo "Starting Node.js server on port $PORT..."
nohup node server.js > node.log 2>&1 &

# Wait a second to check if it started successfully
sleep 1
if pgrep -f "node server.js" > /dev/null; then
  echo "Application successfully started in the background!"
  echo "Logs are being written to node.log"
else
  echo "WARNING: Application failed to start. Check node.log for details."
  cat node.log | tail -n 20
fi
