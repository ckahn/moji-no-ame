# カタカナの雨 — Katakana Rain

A katakana typing game: type the romaji before the kana hits the sea.

## Development

```sh
npm install
npm run dev       # dev server with hot reload
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

Node 24 (pinned in `.tool-versions` for asdf users).

## Deployment

Pushing to `main` on GitHub builds and deploys to GitHub Pages automatically
via `.github/workflows/deploy.yml`.

One-time setup after creating the GitHub repo:

1. Push this project to a repo named `moji-no-ame` (the Vite `base` in
   `vite.config.ts` assumes that name — change both together if you rename it).
2. In the repo settings, under **Settings → Pages**, set **Source** to
   **GitHub Actions**.

The site then lives at `https://<user>.github.io/moji-no-ame/`.

## Code layout

- `src/game/` — pure game logic (kana data, queue building, the tick/input
  engine). No React imports; unit-testable as plain functions.
- `src/components/` — React components for the setup screen, playfield, HUD,
  and game-over report.
- `katakana-rain-5.html` — the original single-file version, kept for
  reference; not part of the build.
