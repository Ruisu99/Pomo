# Pomodoro

Local-first Pomodoro web app (monorepo): focused timer, tasks with projects & templates, ambient/lo-fi sound, streaks, and reports with CSV export.

## Structure

- [`apps/web`](apps/web): Next.js 15 + Tailwind v4 + Zustand UI
- [`packages/core`](packages/core): pure TypeScript domain logic (timer, streaks, storage, estimates)

## Features

- Pomodoro timer with focus mode + site blocking (browser extension)
- Ambient / lo-fi loops (local WAV files under `apps/web/public/audio/`)
- Projects, task templates, finish-time estimate
- Stats: focus minutes, project breakdown, CSV export
- Keyboard: `Space` start/pause · `N` skip · `M` ambient mute/play

## Audio

Ambient loops in `apps/web/public/audio/` are procedurally generated (CC0 / original). No third-party streaming.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+ (`corepack enable pnpm`)

## Commands

```bash
pnpm install
pnpm dev
```

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Deploy

The easiest path is connecting the GitHub repo to [Vercel](https://vercel.com/) (import project → root: `apps/web` or monorepo defaults). CI runs on every push via GitHub Actions.

## iOS later

Keep UI thin and logic in `@pomodoro/core`. A future iOS wrapper can reuse the same package (e.g. Capacitor around the web build, or Expo with shared logic).

## License

MIT
