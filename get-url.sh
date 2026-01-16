#!/bin/bash

# Get Vercel Deployment URL
echo "🔍 Checking Vercel Deployments..."

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# List production deployments
bun x vercel ls --prod

echo ""
echo "☝️ Look for the URL under 'AGE' or 'DEPLOYMENT' column"
