# Browser-Based Editor Feature

## Overview

We're adding a browser-based coding environment to the Leg Tech index site, allowing authenticated users to launch Claude Code (or other coding agents) against any of the 23 project repos directly from the browser. This lets people iterate on and improve the AI-built tools without any local setup.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Browser    │────▶│  API Server  │────▶│  Fly.io Machine │
│  (ghostty-  │     │  (auth +     │     │  (Claude Code + │
│   web term) │◀────│   machines)  │◀────│   project repo) │
└─────────────┘     └──────────────┘     └─────────────────┘
```

### Components

1. **Frontend** (`docs/index.html`): The existing static site, augmented with:
   - Google OAuth login/logout
   - A floating "Edit" button on each project card (visible only when authenticated)
   - Terminal integration via ghostty-web (handled in a separate session)

2. **API Server** (`server/`): A small Node.js server that handles:
   - Google OAuth flow (restricted to `@palisaderesearch.org`)
   - Session management via signed cookies
   - Fly.io Machines API: create a VM, return connection info, destroy VM

3. **Coding VM** (`vm/`): A Docker image deployed as Fly.io Machines, containing:
   - Claude Code (pre-installed)
   - Git + GitHub CLI
   - A startup script that clones the target project repo and sets up a working environment
   - Instructions for Claude Code about the situation (how to push changes, etc.)

## Authentication

**Provider**: Google OAuth 2.0
**Restriction**: Only `@palisaderesearch.org` email addresses are accepted.

Flow:
1. User clicks "Sign in" in the header
2. Redirected to Google OAuth consent screen
3. On callback, server verifies the email domain
4. Server sets a signed session cookie
5. Frontend detects auth state and shows edit buttons

The session cookie is httpOnly and signed with a server secret. The frontend checks auth state via a `/api/auth/me` endpoint.

## VM Provisioning

When a user clicks "Edit" on a project:

1. Frontend calls `POST /api/machines` with `{ repoUrl, projectTitle }`
2. Server verifies the user is authenticated
3. Server calls the Fly.io Machines API to create a new machine from our base image, passing env vars:
   - `REPO_URL` — the GitHub repo to clone
   - `PROJECT_TITLE` — for display/context
4. The VM starts, runs the startup script (clones repo, sets up environment)
5. Server returns the machine ID and WebSocket URL for the terminal
6. Frontend connects ghostty-web to the WebSocket

### VM Lifecycle

- Machines are created on demand and destroyed when the user disconnects or after an idle timeout
- The startup script configures git for pushing changes back to GitHub
- Claude Code gets a `CLAUDE.md` with context about what it's working on

### Provider Abstraction

The machine management layer is designed to be VM-provider agnostic. The core interface:

```
createMachine({ repoUrl, projectTitle }) → { machineId, wsUrl }
destroyMachine(machineId) → void
getMachineStatus(machineId) → { status, wsUrl }
```

We start with Fly.io Machines but could swap in other providers (EC2, GCP, etc.) by implementing this interface.

## VM Image

Base: Ubuntu/Debian
Pre-installed:
- Node.js (for projects that need it)
- Python 3 (for projects that need it)
- Claude Code (`npm install -g @anthropic-ai/claude-code`)
- Git + GitHub CLI
- A WebSocket-to-PTY bridge (so ghostty-web can connect)

Startup script (`vm/startup.sh`):
1. Clone the project repo from `$REPO_URL`
2. Install project dependencies
3. Write a contextual `CLAUDE.md` for the agent
4. Start the WebSocket-to-PTY server
5. Launch a shell in the project directory

## Security Considerations

- Only authenticated `@palisaderesearch.org` users can create machines
- Machines are isolated (each user gets their own Fly.io machine)
- API keys (Fly.io, Anthropic) are injected as secrets, not baked into the image
- Machines have an idle timeout to prevent resource waste
- The WebSocket connection to the VM should be authenticated (machine ID + session token)

## Open Questions

- Should clicking "Edit" open the terminal inline or in a new page?
- Idle timeout duration for VMs
- Whether to pre-build per-project images (faster start) or always clone on startup (simpler)
- How to handle git authentication for pushing changes from the VM
- Rate limiting machine creation
