# Self-Host Runbook

This overlay is designed for teams that want to self-host the Tiledesk dashboard without forking the upstream source tree immediately.

## Scope

This repository does not bundle the upstream dashboard build.

It adds:
- a config audit CLI
- environment templates
- dashboard remote-config templates
- an operator-facing preflight checklist

## Core Upstream Facts

Based on the upstream README:
- Tiledesk Dashboard can run from source, on a web server, or from Docker.
- `dashboard-config.json` is used when `remoteConfig` is enabled.
- Docker launch can use an `.env` file.

## Suggested Flow

1. Start with the upstream dashboard release.
2. Copy `deployment/.env.overlay.example` and fill in service URLs.
3. Copy `deployment/dashboard-config.example.json` and adjust remote config values.
4. Run the audit helper before deployment.
5. Push only after URLs, websocket settings, and brand/integration hooks are confirmed.

## Preflight Questions

- Is `SERVER_BASE_URL` reachable from the dashboard host?
- Is `CHAT_BASE_URL` correct for the chat UI deployment?
- Are widget and bot credential URLs aligned with the same environment?
- If websockets are used, does `wsUrl` match the target reverse proxy behavior?
- If remote scripts are enabled, are they trusted and versioned?

## Recommended Operator Checks

- validate config files with the audit helper
- keep a release note that maps upstream dashboard version to this overlay revision
- do not expose real production secrets in sample config files
