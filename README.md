# tiledesk-dashboard-overlay

Self-host overlay kit for [Tiledesk Dashboard](https://github.com/Tiledesk/tiledesk-dashboard).

This repository does not fork or bundle the upstream dashboard source tree. It adds the operator layer that self-host teams usually need first: config templates, deployment notes, and a preflight audit CLI.

## Upstream Base

- Name: `Tiledesk/tiledesk-dashboard`
- Repository: `https://github.com/Tiledesk/tiledesk-dashboard`
- License: `MIT`

The upstream README currently documents:
- Docker and source-based installation paths
- `dashboard-config.json` when `remoteConfig` is enabled
- `.env`-driven Docker execution

## What This Overlay Adds

- `adapters/audit-config.js`: config and env audit helper
- `deployment/dashboard-config.example.json`: remote-config template
- `deployment/.env.overlay.example`: Docker env template
- `docs/self-host-runbook.md`: operator-facing deployment flow
- `patches/README.md`: patch discipline guide for future upstream changes

## Why Overlay Instead Of Full Copy

For a repo like Tiledesk Dashboard, a full republish would create unnecessary maintenance load. The practical value is in:
- deployment prep
- environment validation
- local operating notes
- repeatable operator checklists

## Quick Start

```bash
npm install
node adapters/audit-config.js \
  --dashboard-config ./deployment/dashboard-config.example.json \
  --env-file ./deployment/.env.overlay.example
```

## Typical Workflow

1. Pull the upstream Tiledesk Dashboard release.
2. Adapt `deployment/.env.overlay.example` to your environment.
3. Adapt `deployment/dashboard-config.example.json` for your runtime URLs.
4. Run the audit helper before deployment.
5. Apply any source-level patches only after config and deployment issues are stable.

## Validation

```bash
npm test
```

## Compliance

See `ATTRIBUTION.md` for upstream details and modification notes.
