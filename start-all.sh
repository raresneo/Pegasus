#!/bin/bash

# Pegasus Elite Hub - Autonomous Startup Script
# This script starts both backend and frontend automatically

echo "🚀 Starting Pegasus Elite Hub (Autonomous Mode)"
echo "================================================"

# Set Bun path
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check if Bun is available
if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found. Please run ./install-bun.sh first"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please configure Supabase credentials"
    exit 1
fi

# Create logs directory
mkdir -p logs

echo ""
echo "📦 Installing dependencies..."
bun install

echo ""
echo "🔧 Starting Backend API..."
bun backend.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo $BACKEND_PID > logs/backend.pid

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check logs/backend.log"
    exit 1
fi

echo ""
echo "🎨 Starting Frontend..."
bun run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo $FRONTEND_PID > logs/frontend.pid

echo ""
echo "================================================"
echo "✅ PEGASUS ELITE HUB IS RUNNING"
echo "================================================"
echo ""
echo "📍 Access your platform:"
echo "   Frontend:  http://localhost:8080"
echo "   Backend:   http://localhost:3000/api"
echo "   Health:    http://localhost:3000/health"
echo ""
echo "📋 Management:"
echo "   Stop:      ./stop-all.sh"
echo "   Logs:      tail -f logs/backend.log"
echo "              tail -f logs/frontend.log"
echo ""
echo "🔄 Running in background. Close this terminal safely."
echo ""

# Keep script running to show it's active (optional)
echo "Press Ctrl+C to view process status..."
trap 'echo ""; echo "Processes still running. Use ./stop-all.sh to stop."; exit 0' INT

# Wait indefinitely (processes run in background)
wait
