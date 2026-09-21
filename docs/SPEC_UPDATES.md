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
6. **Sends a macOS notification** with status (if running on macOS)
7. **Logs** output to the configured log file

If the git working tree is dirty, the script will warn and skip auto-commit. You'll need to manually review changes.

## Notifications

When the script runs via launchd or cron:

- **✅ No changes:** No notification (spec is current)
- **✅ Changes found:** macOS notification appears: `"✅ OpenAPI spec updated! New types generated."`
- **❌ Error:** macOS notification appears: `"❌ Failed to download spec"`

Notifications appear in macOS Notification Center (top-right corner).

## Monitoring

Check the log for detailed activity:
```bash
tail -f ~/Library/Logs/hpe-sd-cloud-spec-check.log
```

You'll see entries like:
```
[2026-09-21 06:00:00] Checking for OpenAPI spec updates...
[2026-09-21 06:00:02] OK: Spec is current (MD5: 339294774b8db9a7ff811e18f24bf908)
```

Or if updates are found:
```
[2026-09-21 06:00:00] Checking for OpenAPI spec updates...
[2026-09-21 06:00:02] UPDATE: Spec has changed! (was: abc123..., now: def456...)
[2026-09-21 06:00:03] UPDATE: Regenerating types and rebuilding...
[2026-09-21 06:00:08] SUCCESS: Spec updated and types regenerated. Review the diff before deploying.
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
