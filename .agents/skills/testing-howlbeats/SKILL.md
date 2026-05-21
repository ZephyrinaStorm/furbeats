---
name: testing-howlbeats
description: Test the HowlBeats Discord bot dashboard and mockup-sandbox end-to-end. Use when verifying dashboard UI, API endpoints, or mockup-sandbox changes.
---

# Testing HowlBeats

## Prerequisites

- Node.js v22+
- pnpm 9.x
- Run `pnpm install` from repo root

## Devin Secrets Needed

None required for basic testing. The dashboard runs in **web-only mode** without Discord credentials.

For full bot testing (not just dashboard), you would need:
- `DISCORD_TOKEN` — Bot token from Discord Developer Portal
- `DISCORD_CLIENT_ID` — OAuth2 client ID for dashboard login
- `DISCORD_CLIENT_SECRET` — OAuth2 client secret for dashboard login

## Build & Typecheck

```bash
cd /home/ubuntu/furbeats
pnpm run build    # runs typecheck + vite build (mockup-sandbox) + esbuild (api-server)
pnpm run typecheck  # typecheck only
```

## Starting the Dashboard (Web-Only Mode)

```bash
cd artifacts/api-server
PORT=8080 WEB_ONLY=true NODE_ENV=development node dist/index.mjs
```

Expected console output:
- `[HowlBeats] 55 commands loaded`
- `[HowlBeats] DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET not set — OAuth disabled (public pages only)`
- `[HowlBeats] Dashboard listening on port 8080`

If the server crashes with `OAuth2Strategy requires a clientID option`, the passport-discord conditional initialization may have regressed — check `bot/dashboard/index.js` for the `hasOAuth` guard.

## Testable Dashboard Routes

### Public Pages (no auth needed)
| Route | Expected Title | Key Content |
|-------|---------------|-------------|
| `/` | HowlBeats — Music with a Soul | Hero heading "Music with a Soul.", platform icons |
| `/commands` | HowlBeats — Commands | "55 commands" text, 5 category tabs |
| `/about` | About — HowlBeats | Live stats, tech stack, timeline |
| `/terms` | HowlBeats — Terms of Service | Legal document content |
| `/privacy` | HowlBeats — Privacy Policy | Data collection table |

### API Endpoints
| Endpoint | Expected Response |
|----------|------------------|
| `/api/healthz` | `{"ok":true,"bot":"not ready"}` (in web-only mode) |
| `/api/stats` | `{"guilds":0,"users":0,"commands":55,"players":0,"ping":-1,...}` |

### Auth Routes (without OAuth credentials)
| Route | Expected Behavior |
|-------|-------------------|
| `/login` | Redirects to `/?error=OAuth+not+configured` |
| `/dashboard` | Redirects to `/login` → `/?error=OAuth+not+configured` |
| `/callback` | Redirects to `/` |

### Static Assets
- `/style.css` — should return HTTP 200 with CSS
- `/furry-avatar.jpg` — should return HTTP 200 with image
- `/logo.png` — should return HTTP 200 with image

## Starting the Mockup-Sandbox

```bash
cd mockup-sandbox
pnpm run dev
```

Expected: Vite dev server on `http://localhost:5173/` showing "Component Preview Server" heading.

## Known Issues

- **Error banner on home page**: The EJS template at `bot/dashboard/views/index.ejs` checks `locals.query.error` to display error banners, but the Express route at `bot/dashboard/index.js` line ~153 does not pass `req.query` to the template. Error banners from query params (e.g., `/?error=OAuth+not+configured`) might not render visually. The redirect itself still works correctly.
- **Lavalink connection warnings**: The bot logs Lavalink connection attempts to `ws://localhost:8000` on startup. These are expected to fail in local dev without a running Lavalink server and do not affect dashboard functionality.

## Testing Tips

- Always build before testing: `pnpm run build` from repo root
- The command count (55) comes from bot command files in `bot/commands/` — if commands are added/removed, update expected counts
- The dashboard uses EJS server-side rendering — check `bot/dashboard/views/` for template issues
- Static assets are served from `bot/dashboard/public/`
