# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is **HowlBeats** — a furry-themed Discord music bot with a full web dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Bot framework**: discord.js v14
- **Music**: Kazagumo v3 (Lavalink wrapper) + Shoukaku v4
- **Dashboard**: Express 5 + EJS + passport-discord OAuth2
- **Persistence**: Custom JsonStore (JSON file-based, at `bot/lib/JsonStore.js`)
- **Build**: esbuild (bundles TS → ESM `.mjs`)

## Architecture

### Bot entry
- `artifacts/api-server/src/index.ts` — TypeScript entry, compiled by esbuild. Uses `globalThis.require` (injected by esbuild banner) to load the CommonJS bot code.
- `artifacts/api-server/bot/index.js` — Main Discord bot entry (CommonJS). Sets up discord.js Client, Kazagumo (Lavalink), handlers, and starts the dashboard on bot ready.
- `artifacts/api-server/bot/package.json` — Contains `{ "type": "commonjs" }` to override the parent package's `"type": "module"` for all bot JS files.

### Bot structure
```
bot/
  index.js            — Discord client + Kazagumo setup, starts dashboard
  config/
    config.json       — Bot prefix, name, color, footer
    filters.json      — 19 audio filters (bassboost, nightcore, 8d, etc.)
    settings.json     — Cooldown defaults, owner IDs
  lib/
    JsonStore.js      — Simple JSON-file persistence (replaces Enmap which is ESM-only)
    filterPresets.js  — Lavalink filter presets (10 presets) + mergeFilters/applyFilters helpers
  handlers/
    commands.js       — Loads all command files from commands/
    events.js         — Loads all event files from events/
    lavalinkEvents.js — Kazagumo/Shoukaku events, now-playing embeds + button controls
    functions.js      — Utilities: createBar, msToTime, check_if_dj, onCoolDown, etc.
  commands/                     — 54 commands total (slash commands only, no prefix)
    Filter/           — filters, addfilter, setfilter, removefilter, clearfilters, custombassboost, speed
    Music/            — play, skip, stop, pause, resume, nowplaying, volume, seek, autoplay, playskip, playtop
                        replay, forward, rewind, voteskip, 247, related, radio, lyrics
    Queue/            — queue (list), shuffle, unshuffle, loop, remove, clear, jump, move, previous, status
                        history, playlist (save/load/list/delete)
    Info/             — help, ping, botinfo, commandcount, dashboard, invite, uptime
    Settings/         — prefix, dj, defaultvolume, defaultfilter, defaultautoplay, botchat, autoresume, setupmusic
                        restrict, announce
  events/
    client/           — ready (presence), error
    guild/            — messageCreate (music-channel typing only, no prefix dispatch), voiceStateUpdate (auto-leave + 247 mode)
  dashboard/
    index.js          — Express dashboard server (passport-discord OAuth, EJS rendering)
    views/            — index.ejs, commands.ejs, dashboard.ejs, settings.ejs, queue.ejs, header.ejs
    public/style.css  — Furry amber/orange dark theme
  databases/          — Persistent JSON stores (settings.json, infos.json)
```

### Dashboard routes
- `/` — Home page (hero + feature cards)
- `/commands` — All commands listing
- `/login` — Discord OAuth2 login
- `/callback` — OAuth2 callback
- `/dashboard` — Server list (requires login)
- `/dashboard/:guildID` — Guild settings (prefix, volume, DJ roles, bot channels)
- `/queue/:guildID` — Live queue viewer (auto-refreshes every 3s)
- `/api/healthz` — Health check

## Environment Secrets Required
- `DISCORD_TOKEN` — Bot token
- `DISCORD_CLIENT_ID` — OAuth2 app client ID
- `DISCORD_CLIENT_SECRET` — OAuth2 app client secret
- `LAVALINK_HOST` — Lavalink server host
- `LAVALINK_PORT` — Lavalink server port
- `LAVALINK_PASSWORD` — Lavalink server password
- `SESSION_SECRET` — Express session secret

## Furry Theme
- Primary color: `#FF8C00` (amber/orange)
- Background: `#1a1210` (dark brown)
- Accent: `#FF6B35`
- Paw print motifs throughout the UI
- Bot is slash-command only — no prefix commands (music channel typing still works)

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — Build and run the bot + dashboard
- `pnpm --filter @workspace/api-server run build` — Build only (esbuild)

## Notes
- The Lavalink node error 400 on startup is expected if Lavalink isn't running — the bot will retry automatically.
- The esbuild banner injects `globalThis.require` and `globalThis.__dirname` so CJS bot code can be required from ESM TypeScript.
- `bot/package.json` overrides `"type": "commonjs"` for all files in the bot directory.
