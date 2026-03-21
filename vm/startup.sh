#!/bin/bash
set -e

echo "=== Leg Tech Coding VM ==="

# Pull latest for all repos in background (non-blocking)
for dir in /workspace/*/; do
  (cd "$dir" && git pull --ff-only 2>/dev/null) &
done
# Don't wait — let pulls finish in background while user works

# Configure Claude Code for the coder user
CODER_HOME="/home/coder"
mkdir -p "${CODER_HOME}/.claude"
KEY_SUFFIX=$(echo -n "$ANTHROPIC_API_KEY" | tail -c 20)

# Build trust entries for all project dirs
TRUST_ENTRIES=""
for dir in /workspace/*/; do
  TRUST_ENTRIES="${TRUST_ENTRIES}    \"${dir%/}\": { \"hasTrustDialogAccepted\": true },
"
done

cat > "${CODER_HOME}/.claude.json" <<CLAUDE_JSON
{
  "theme": "dark",
  "hasCompletedOnboarding": true,
  "projects": {
${TRUST_ENTRIES}    "/workspace": { "hasTrustDialogAccepted": true }
  },
  "effortCalloutDismissed": true,
  "customApiKeyResponses": {
    "approved": ["${KEY_SUFFIX}"],
    "rejected": []
  }
}
CLAUDE_JSON

cat > "${CODER_HOME}/.claude/settings.json" <<CLAUDE_SETTINGS
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  },
  "skipDangerousModePermissionPrompt": true
}
CLAUDE_SETTINGS

chown -R coder:coder "${CODER_HOME}/.claude" "${CODER_HOME}/.claude.json"

# Make ANTHROPIC_API_KEY and PATH available to coder's shell
echo "export ANTHROPIC_API_KEY='${ANTHROPIC_API_KEY}'" >> "${CODER_HOME}/.bashrc"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${CODER_HOME}/.bashrc"

# Warm up Claude Code (first run does init work)
echo "Warming up Claude Code..."
su - coder -c 'cd /workspace && ANTHROPIC_API_KEY="'"${ANTHROPIC_API_KEY}"'" PATH="$HOME/.local/bin:$PATH" claude --model haiku -p "reply with ok" --no-input' 2>&1 || true
echo "Claude Code warm-up complete."

# Start the WebSocket-to-PTY bridge
echo "Starting terminal server on port 8080..."
cd /workspace
exec node /opt/ws-pty-bridge.js
