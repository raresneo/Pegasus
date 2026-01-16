#!/bin/bash

# Restart Backend Only
echo "🔄 Restarting Backend for CORS updates..."

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

cd "$(dirname "$0")"

# Find and kill backend
if [ -f "logs/backend.pid" ]; then
    PID=$(cat logs/backend.pid)
    kill $PID 2>/dev/null
fi

# Start backend again
bun backend.js > logs/backend.log 2>&1 &
NEW_PID=$!
echo $NEW_PID > logs/backend.pid

echo "✅ Backend restarted (PID: $NEW_PID)"
echo "Waiting for ready..."
sleep 2
echo "Done!"
