#!/bin/bash
set -euo pipefail

# Check OpenAPI spec for updates and regenerate if changed
# Run via cron/launchd or manually

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC_URL="https://www.juniper.net/documentation/us/en/software/sd-cloud/api/static/exports/security-director-cloud-apis-openapi3json.json"
SPEC_FILE="$PROJECT_DIR/spec/openapi.json"
TEMP_SPEC=$(mktemp)

# Cleanup on exit
cleanup() {
  rm -f "$TEMP_SPEC"
}
trap cleanup EXIT

# Send macOS notification
notify() {
  local title="$1"
  local message="$2"

  if [ "$(uname)" = "Darwin" ]; then
    osascript -e "display notification \"$message\" with title \"$title\"" 2>/dev/null || true
  fi
}

log_msg() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log_msg "Checking for OpenAPI spec updates..."

# Download live spec
if ! curl -sf "$SPEC_URL" -o "$TEMP_SPEC"; then
  log_msg "ERROR: Failed to download spec from $SPEC_URL"
  notify "HPE SD Cloud Spec Check" "❌ Failed to download spec"
  exit 1
fi

# Compare checksums
LOCAL_MD5=$(md5 -q "$SPEC_FILE" 2>/dev/null || md5sum "$SPEC_FILE" | awk '{print $1}')
LIVE_MD5=$(md5 -q "$TEMP_SPEC" 2>/dev/null || md5sum "$TEMP_SPEC" | awk '{print $1}')

if [ "$LOCAL_MD5" = "$LIVE_MD5" ]; then
  log_msg "OK: Spec is current (MD5: $LOCAL_MD5)"
  exit 0
fi

log_msg "UPDATE: Spec has changed! (was: $LOCAL_MD5, now: $LIVE_MD5)"
log_msg "UPDATE: Regenerating types and rebuilding..."

# Update vendored spec
cp "$TEMP_SPEC" "$SPEC_FILE"

# Regenerate types
cd "$PROJECT_DIR"
npm run generate:types > /dev/null 2>&1

# Rebuild
npm run build > /dev/null 2>&1

# Git commit if repo is clean enough
if git diff-index --quiet HEAD --; then
  git add spec/openapi.json src/generated/schema.d.ts
  git commit -m "Update OpenAPI spec and regenerate types

Spec MD5 changed from $LOCAL_MD5 to $LIVE_MD5.
Types regenerated via automated check script.

Co-Authored-By: Automated Spec Check <noreply@localhost>
" > /dev/null 2>&1 || log_msg "WARN: Git commit failed (repo may be dirty)"
else
  log_msg "WARN: Git working tree is dirty, skipping auto-commit. Manual review recommended."
fi

log_msg "SUCCESS: Spec updated and types regenerated. Review the diff before deploying."
notify "HPE SD Cloud Spec Check" "✅ OpenAPI spec updated! New types generated."
