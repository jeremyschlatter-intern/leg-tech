#!/bin/bash
set -e

echo "=== Leg Tech Coding VM ==="
echo "Project: ${PROJECT_TITLE}"
echo "Repo: ${REPO_URL}"

# Clone the project repo
if [ -n "$REPO_URL" ]; then
    echo "Cloning ${REPO_URL}..."
    git clone "$REPO_URL" /workspace/project
    cd /workspace/project

    # Install dependencies if applicable
    if [ -f "package.json" ]; then
        echo "Installing Node.js dependencies..."
        npm install
    fi
    if [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies..."
        pip3 install -r requirements.txt
    fi
fi

# Write contextual CLAUDE.md for the agent
cat > /workspace/project/CLAUDE.md <<AGENT_INSTRUCTIONS
# Editing: ${PROJECT_TITLE}

You are editing a Leg Tech project — one of 23 AI-built tools for congressional staff.

## Context
- This project was originally built autonomously by Claude Code.
- A user is now editing it via a browser-based terminal.
- The repo was cloned from: ${REPO_URL}

## Pushing Changes
- The repo has a GitHub remote configured.
- Create a new branch for your changes: \`git checkout -b edit/\$(date +%Y%m%d-%H%M%S)\`
- Commit and push when the user is happy with the changes.
- If you need to create a PR, use \`gh pr create\`.

## Deployment
- If this is a GitHub Pages project, pushing to main will auto-deploy.
- If this is a Fly.io project, check for a fly.toml and use \`fly deploy\` if available.
AGENT_INSTRUCTIONS

# Start the WebSocket-to-PTY bridge
echo "Starting terminal server on port 8080..."
cd /workspace/project
exec node /opt/ws-pty-bridge.js
