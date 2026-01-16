#!/bin/bash

echo "🚀 Instalare automată Bun pentru Pegasus Elite Hub"
echo "=================================================="
echo ""

# Check if Bun is already installed
if command -v bun &> /dev/null; then
    echo "✅ Bun este deja instalat!"
    bun --version
    exit 0
fi

echo "📦 Instalez Bun..."
echo ""

# Install Bun
curl -fsSL https://bun.sh/install | bash

echo ""
echo "=================================================="
echo "✅ Instalare completă!"
echo ""
echo "🔄 Reîncarcă terminalul sau rulează:"
echo "    source ~/.bashrc"
echo "    # sau"  
echo "    source ~/.zshrc"
echo ""
echo "📋 Următorii pași:"
echo "1. Închide și redeschide terminal-ul (sau rulează source ~/.zshrc)"
echo "2. Rulează: cd $(pwd)"
echo "3. Rulează: bun install"
echo "4. Rulează: bun api/supabase/test-connection.js"
echo ""
