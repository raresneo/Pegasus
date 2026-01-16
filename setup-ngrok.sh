#!/bin/bash

# Pegasus Elite Hub - ngrok Public Access
# Makes your local platform accessible from anywhere!

echo "🌐 Setting up ngrok for public access..."
echo "========================================"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    brew install ngrok
    
    if [ $? -ne 0 ]; then
        echo "❌ Homebrew not found. Installing manually..."
        echo "Download from: https://ngrok.com/download"
        echo "Or use: curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
        exit 1
    fi
fi

echo "✅ ngrok is ready!"
echo ""
echo "🚀 NEXT STEPS:"
echo ""
echo "1. Open TWO terminal windows/tabs:"
echo ""
echo "   Terminal 1 - Start Pegasus Platform:"
echo "   ------------------------------------"
echo "   cd $(pwd)"
echo "   export BUN_INSTALL=\"\$HOME/.bun\" && export PATH=\"\$BUN_INSTALL/bin:\$PATH\""
echo "   ./start-all.sh"
echo ""
echo "2. Wait for both backend and frontend to start (wait 10 seconds)"
echo ""
echo "   Terminal 2 - Create Public Tunnel:"
echo "   ----------------------------------"
echo "   ngrok http 8080"
echo ""
echo "3. Copy the https://XXXX.ngrok.io URL"
echo "4. Share it with anyone - platforma va fi accesibilă public!"
echo ""
echo "🎯 That's it! Platformă live în 2 minute!"
echo ""
