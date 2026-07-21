# Pomodoro

Local-first Pomodoro web app (monorepo): focused timer, tasks with projects & templates, focus radio, streaks, and reports with CSV export.

## Structure

- [`apps/web`](apps/web): Next.js 15 + Tailwind v4 + Zustand UI
- [`packages/core`](packages/core): pure TypeScript domain logic (timer, streaks, storage, estimates)

## Features

- Pomodoro timer with custom durations
- Focus radio (Lofi Girl + Jazz YouTube streams)
- Projects, task templates, finish-time estimate
- Stats: focus minutes, project breakdown, CSV export
- English / German UI
- Keyboard: `Space` start/pause · `N` skip · `M` mute radio

## Audio

Focus music uses YouTube live streams ([Lofi Girl](https://www.youtube.com/watch?v=X4VbdwhkE10), [Jazz](https://www.youtube.com/watch?v=E2vONfzoyRI)).

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

Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://pomo.example.com`) so sitemap, canonical URLs, and Open Graph resolve correctly. See `apps/web/.env.example`.

## iOS later

Keep UI thin and logic in `@pomodoro/core`. A future iOS wrapper can reuse the same package (e.g. Capacitor around the web build, or Expo with shared logic).

## License

MIT
