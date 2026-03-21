# Leg Tech

Index site for 23 AI-built congressional technology tools, created as a demo for congressional staffers of what coding agents can do. Each tool was conceived by congressional staff (specs from [Daniel Schuman's Leg Tech wiki](https://github.com/DanielSchuman/Policy/wiki/Leg-Tech)) and built autonomously by Claude Code.

## Structure

- `docs/index.html` — The index page. Single self-contained HTML file (no build tools, no framework). Deployed via GitHub Pages at `jeremyschlatter-intern.github.io/leg-tech/`.
- `docs/view.html` — App viewer page. Loads a tool in an iframe with nav bar, auth, floating edit button, and inline ghostty-web terminal.
- `docs/ghostty-web/` — Vendored ghostty-web (coder/ghostty-web) ESM build + WASM. The JS bundle has the WASM embedded as base64.
- `server/` — Backend API for authentication and VM machine management.
- `vm/` — Dockerfile, startup script, and WS-PTY bridge for coding VMs.
- `Leg-Tech.md` — Extended project documentation/specs.
- `EDITOR.md` — Design doc for the browser-based editor feature.

## The 23 Projects

All project repos live in the `jeremyschlatter-intern` GitHub org. Some are static sites on GitHub Pages (`jeremyschlatter-intern.github.io/<repo>/`), others run on Fly.io (`leg-tech-<name>.fly.dev`). Projects are defined as a JS array in `docs/index.html`.

## Browser-Based Editor

Authenticated users can edit any of the 23 apps via a browser-based terminal running Claude Code.

- **Terminal UI**: ghostty-web (vendored in `docs/ghostty-web/`). Inline split-view — terminal slides up from bottom of the app viewer page.
- **Authentication**: Google OAuth, restricted to `@palisaderesearch.org`. OAuth creds in `.env` as 1Password refs (Employee vault).
- **VM provisioning**: On-demand Fly.io machines (`leg-tech-vms` app). Each VM has Claude Code installed and clones the relevant project repo on startup. Uses `fly_instance_id` query param to route WebSocket to the right machine.
- **Backend API** (`server/`): Handles OAuth flow, session cookies, Fly.io Machines API calls. Deployed as `leg-tech` Fly.io app.

## Deployment

- **Index site**: GitHub Pages (push to `docs/`), `jeremyschlatter-intern.github.io/leg-tech/`
- **Backend API**: Fly.io app `leg-tech` in `palisade-research-595` org, region `iad`
- **Coding VMs**: Fly.io app `leg-tech-vms` in `palisade-research-595` org, region `iad`

## Environment / Secrets

Secrets set on `leg-tech` Fly app: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `COOKIE_SECRET`, `FLY_API_TOKEN`.
