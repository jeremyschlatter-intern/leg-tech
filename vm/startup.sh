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

# Make env vars and PATH available to coder's shell
echo "export ANTHROPIC_API_KEY='${ANTHROPIC_API_KEY}'" >> "${CODER_HOME}/.bashrc"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${CODER_HOME}/.bashrc"
if [ -n "$GITHUB_TOKEN" ]; then
  echo "export GITHUB_TOKEN='${GITHUB_TOKEN}'" >> "${CODER_HOME}/.bashrc"
  # Configure git to use the token for HTTPS push to jeremyschlatter-intern repos
  su coder -c "git config --global credential.helper 'store'"
  echo "https://x-access-token:${GITHUB_TOKEN}@github.com" > "${CODER_HOME}/.git-credentials"
  chown coder:coder "${CODER_HOME}/.git-credentials"
  chmod 600 "${CODER_HOME}/.git-credentials"
fi
if [ -n "$FLY_API_TOKEN" ]; then
  echo "export FLY_API_TOKEN='${FLY_API_TOKEN}'" >> "${CODER_HOME}/.bashrc"
fi

# Install refresh-preview script: notifies all browsers to reload the app iframe
mkdir -p "${CODER_HOME}/bin"
cat > "${CODER_HOME}/bin/refresh-preview" << 'ENDSCRIPT'
#!/bin/sh
curl -s -X POST "https://leg-tech.fly.dev/api/refresh/$(basename "$PWD")" >/dev/null 2>&1
ENDSCRIPT
chmod +x "${CODER_HOME}/bin/refresh-preview"
echo 'export PATH="$HOME/bin:$PATH"' >> "${CODER_HOME}/.bashrc"
chown -R coder:coder "${CODER_HOME}/bin"

# Warm up Claude Code (first run does init work)
echo "Warming up Claude Code..."
su - coder -c 'cd /workspace && ANTHROPIC_API_KEY="'"${ANTHROPIC_API_KEY}"'" PATH="$HOME/.local/bin:$PATH" claude --model haiku -p "reply with ok" --no-input' 2>&1 || true
echo "Claude Code warm-up complete."

# Start the WebSocket-to-PTY bridge
echo "Starting terminal server on port 8080..."
cd /workspace
exec node /opt/ws-pty-bridge.js
