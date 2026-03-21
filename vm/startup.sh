#!/bin/bash
set -e

echo "=== Leg Tech Coding VM ==="

# All project repos in the jeremyschlatter-intern org
REPOS=(
  unified-hearing-markup-data
  youtube-video-dashboard
  gao-hearing-connector
  floor-schedule
  committee-transcripts
  witness-database
  appropriations-notices-tracker
  submit-appropriations-documentation
  appropriations-tracker
  crs-reports-to-html
  gao-reports-reader
  crs-reports-to-wikipedia
  house-disbursements-data
  bills-to-committee
  bill-delay-tracker
  congressional-job-tracker
  govtrack-newsletter-generator
  resolution-alerts
  congressional-rfps
  house-committee-spending
  committee-funding-tracker
  appropriations-explorer
  cbj-approps-alignment
  leg-tech-editor-test-app
)

# Clone all repos in parallel
echo "Cloning all project repos..."
for repo in "${REPOS[@]}"; do
  git clone "https://github.com/jeremyschlatter-intern/${repo}.git" "/workspace/${repo}" 2>&1 &
done
wait
chown -R coder:coder /workspace
echo "All repos cloned."

# Configure Claude Code for the coder user
CODER_HOME="/home/coder"
mkdir -p "${CODER_HOME}/.claude"
KEY_SUFFIX=$(echo -n "$ANTHROPIC_API_KEY" | tail -c 20)

# Build trust entries for all project dirs
TRUST_ENTRIES=""
for repo in "${REPOS[@]}"; do
  TRUST_ENTRIES="${TRUST_ENTRIES}    \"/workspace/${repo}\": { \"hasTrustDialogAccepted\": true },
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

# Make ANTHROPIC_API_KEY available to coder's shell
echo "export ANTHROPIC_API_KEY='${ANTHROPIC_API_KEY}'" >> "${CODER_HOME}/.bashrc"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${CODER_HOME}/.bashrc"

# Start the WebSocket-to-PTY bridge
echo "Starting terminal server on port 8080..."
cd /workspace
exec node /opt/ws-pty-bridge.js
