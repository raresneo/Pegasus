#!/bin/bash

# Quick Fix and Restart Script

echo "🔧 Fixing dependencies and restarting..."

# Set Bun path
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

cd "$(dirname "$0")"

# Stop everything
echo "🛑 Stopping services..."
./stop-all.sh 2>/dev/null

# Install dependencies
echo "📦 Installing missing dependencies..."
bun install

# Start everything with public access
echo "🚀 Starting platform with public access..."
./start-public.sh
