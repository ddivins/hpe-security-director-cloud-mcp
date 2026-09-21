# OpenAPI Spec Update Automation

The OpenAPI spec is automatically checked for updates via `scripts/check-spec-updates.sh`.

## Setup

### Option 1: macOS launchd (recommended)

Create a LaunchAgent that runs the check daily:

```bash
cat > ~/.config/launchd/local.hpe-sd-cloud.spec-check.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>local.hpe-sd-cloud.spec-check</string>
  
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/ddivins/Development/hpe-security-director-cloud-mcp/scripts/check-spec-updates.sh</string>
  </array>
  
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>06</integer>
    <key>Minute</key>
    <integer>00</integer>
  </dict>
  
  <key>StandardOutPath</key>
  <string>/Users/ddivins/Library/Logs/hpe-sd-cloud-spec-check.log</string>
  
  <key>StandardErrorPath</key>
  <string>/Users/ddivins/Library/Logs/hpe-sd-cloud-spec-check.log</string>
</dict>
</plist>
EOF

# Load it
launchctl load ~/.config/launchd/local.hpe-sd-cloud.spec-check.plist

# Verify it's loaded
launchctl list | grep hpe-sd-cloud
```

**What this does:**
- Runs the spec check every day at 6:00 AM
- Logs output to `~/Library/Logs/hpe-sd-cloud-spec-check.log`
- Automatically regenerates types and commits if changes are found

**To unload it later:**
```bash
launchctl unload ~/.config/launchd/local.hpe-sd-cloud.spec-check.plist
```

### Option 2: cron

Edit your crontab:
```bash
crontab -e
```

Add a line to check daily (e.g., 6 AM):
```cron
0 6 * * * /Users/ddivins/Development/hpe-security-director-cloud-mcp/scripts/check-spec-updates.sh >> /Users/ddivins/Library/Logs/hpe-sd-cloud-spec-check.log 2>&1
```

### Manual check

Run anytime to check for updates:
```bash
./scripts/check-spec-updates.sh
```

## What happens when updates are found

1. **Downloads** the live spec
2. **Compares** MD5 checksums
3. **Regenerates** TypeScript types (`npm run generate:types`)
4. **Rebuilds** the project (`npm run build`)
5. **Commits** the changes with a descriptive message
6. **Logs** output to the configured log file

If the git working tree is dirty, the script will warn and skip auto-commit. You'll need to manually review changes.

## Monitoring

Check the log for any issues:
```bash
tail -f ~/Library/Logs/hpe-sd-cloud-spec-check.log
```

If updates are found, you'll see:
```
[2026-09-21 06:00:00] Checking for OpenAPI spec updates...
[UPDATE] Spec has changed! (was: abc123..., now: def456...)
[UPDATE] Regenerating types and rebuilding...
[SUCCESS] Spec updated and types regenerated. Review the diff before deploying.
```

Then review and redeploy:
```bash
git log -1  # see what changed
npm run build
# Restart Claude Desktop to pick up new MCP server
```
