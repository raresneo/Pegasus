#!/bin/bash

# Pegasus - One Click Public Access
# Pornește totul și creează tunnel public automat!

echo "🚀 Starting Pegasus with Public Access..."
echo "=========================================="

# Set Bun path
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Stop any existing instances
echo "🧹 Cleaning up old processes..."
./stop-all.sh 2>/dev/null

# Start platform
echo "🚀 Starting platform..."
./start-all.sh

# Wait for services to be ready
echo "⏳ Waiting for services (15 seconds)..."
sleep 15

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Installing..."
    brew install ngrok
fi

echo ""
echo "================================================"
echo "🌐 Creating Public Tunnel..."
echo "================================================"
echo ""
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3000/api"
echo ""
echo "Starting ngrok tunnel..."
echo "Your public URL will appear below:"
echo ""

# Start ngrok and keep it in foreground
ngrok http 8080
