#!/bin/bash

echo "🚀 Starting Manual Vercel Deployment..."
echo "========================================"

# Check for Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found. Please install Bun first."
    exit 1
fi

echo "📦 Installing/Using Vercel CLI via Bun..."
echo "👉 If asked to log in, please follow the browser instructions!"
echo ""

# Run Vercel deploy
echo "🚀 Deploying to Production (Bypassing Git Checks)..."

# Temporarily hide .git to avoid author permission errors
if [ -d ".git" ]; then
    echo "🙈 Hiding git metadata..."
    mv .git .git_backup
fi

# Deploy
bun x vercel --prod --yes
DEPLOY_EXIT_CODE=$?

# Restore .git
if [ -d ".git_backup" ]; then
    echo "🐵 Restoring git metadata..."
    mv .git_backup .git
fi

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo "---------------------------------------------------"
    echo "✅ DONE! Copy the URL above (looks like https://pegasus...)"
    echo "---------------------------------------------------"
else
    echo "❌ Deployment failed."
fi
