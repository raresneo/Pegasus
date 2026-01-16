#!/bin/bash

# Pegasus Elite Hub - Status Check Script

echo "📊 Pegasus Elite Hub Status"
echo "==========================="

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check backend
echo ""
echo "🔧 Backend:"
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "   Status: ✅ Running (PID: $BACKEND_PID)"
        echo "   URL: http://localhost:3000/api"
        
        # Test backend health
        if command -v curl &> /dev/null; then
            HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null)
            if [ $? -eq 0 ]; then
                echo "   Health: ✅ Online"
            else
                echo "   Health: ⚠️  Unreachable"
            fi
        fi
    else
        echo "   Status: ❌ Not running"
    fi
else
    echo "   Status: ❌ Not running"
fi

# Check frontend
echo ""
echo "🎨 Frontend:"
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   Status: ✅ Running (PID: $FRONTEND_PID)"
        echo "   URL: http://localhost:8080"
    else
        echo "   Status: ❌ Not running"
    fi
else
    echo "   Status: ❌ Not running"
fi

# Show recent logs
echo ""
echo "📋 Recent Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
