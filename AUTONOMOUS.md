# 🚀 Pegasus Elite Hub - Autonomous Mode

## Quick Start (1 Command)

```bash
./start-all.sh
```

That's it! Both backend and frontend will start automatically in the background.

## Access Your Platform

- **Frontend (UI)**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Management Commands

### Start Everything
```bash
./start-all.sh
```

### Stop Everything
```bash
./stop-all.sh
```

### Check Status
```bash
./status.sh
```

### View Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log
```

## How It Works

The `start-all.sh` script:
1. ✅ Checks dependencies (Bun, .env.local)
2. ✅ Installs npm packages
3. ✅ Starts backend in background (port 3000)
4. ✅ Starts frontend in background (port 8080)
5. ✅ Saves process IDs for management
6. ✅ Creates log files for debugging

Everything runs **autonomously** - you can close the terminal and it keeps running!

## Troubleshooting

**If something doesn't start:**
```bash
# Check status
./status.sh

# View backend errors
cat logs/backend.log

# View frontend errors
cat logs/frontend.log

# Restart everything
./stop-all.sh
./start-all.sh
```

**Ports already in use:**
```bash
# Find what's using port 3000
lsof -ti:3000 | xargs kill -9

# Find what's using port 8080
lsof -ti:8080 | xargs kill -9

# Then restart
./start-all.sh
```

## Production Deployment

For production, consider:
1. **PM2** for process management
2. **Nginx** for reverse proxy
3. **SSL/HTTPS** for security
4. **Domain** instead of localhost

## Auto-Start on System Boot (Optional)

### macOS (LaunchAgent)
Create `~/Library/LaunchAgents/com.pegasus.hub.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pegasus.hub</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/YOUR_USERNAME/Desktop/pegasus-core---professional-asset-&-client-management/start-all.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
```

Then:
```bash
launchctl load ~/Library/LaunchAgents/com.pegasus.hub.plist
```

---

**🎯 Total Autonomy Achieved!** Your platform now runs completely independently.
