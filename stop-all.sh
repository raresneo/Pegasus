#!/bin/bash

# Pegasus Elite Hub - Stop Script

echo "🛑 Stopping Pegasus Elite Hub..."
echo "================================"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Stop backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    else
        echo "ℹ️  Backend not running"
    fi
    rm logs/backend.pid
else
    echo "ℹ️  Backend PID file not found"
fi

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    else
        echo "ℹ️  Frontend not running"
    fi
    rm logs/frontend.pid
else
    echo "ℹ️  Frontend PID file not found"
fi

echo ""
echo "✅ Pegasus Elite Hub stopped successfully"
