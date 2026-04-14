# Pomodoro

Local-first Pomodoro web app (monorepo): focused timer, lightweight tasks, streaks, and a simple 7‑day chart.

## Structure

- [`apps/web`](apps/web): Next.js 15 + Tailwind v4 + Zustand UI
- [`packages/core`](packages/core): pure TypeScript domain logic (timer, streaks, storage types)

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
