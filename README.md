# Dartrack

Dartrack is a small React + Vite single-page app (SPA) for tracking darts games (301 / 501). It focuses on quick keyboard/touch input with a mobile-first keypad that supports "tap = single" and "hold = multiplier (double/triple)" via a hold-and-drag popup. The project is built with Vite and styled with Tailwind utilities.

---

## Features

- 301 and 501 game modes
- Per-player scores, turn scores, and three-throw tracking
- Hold-and-drag multiplier popup (long-press a number to select double/triple)
- Undo (last throw), undo bust and winner undo
- Inline player name editing
- End-of-turn modal with inline throw editing
- Local persistence (localStorage) with a short expiry
- Small onboarding hint bubble that appears when a new game starts

---

## Tech stack

- React 19 (functional components + hooks)
- Vite for bundling / dev server
- Tailwind-like utility classes (utility-first CSS styles present)

---

## Getting started (local development)

Prerequisites:
- Node.js (LTS recommended). If you need to pin a version, add an `engines` field to `package.json`.
- Git

Recommended (PowerShell):

```powershell
# in project root
npm ci
npm run dev
```

- `npm run dev` starts the Vite dev server (PowerShell example above). Vite prints a local URL (e.g., http://localhost:5173).
- Open the printed URL in your browser to try the app.

Notes for Windows/PowerShell: use the PowerShell commands above. Use `Ctrl+F5` or a private window to hard-refresh assets like favicons.

---

## Production build & preview

Build the production bundle and preview it locally:

```powershell
npm run build
npm run preview
```

- `npm run build` runs `vite build` and outputs to `dist/` by default.
- `npm run preview` serves the `dist/` folder so you can verify routing/404s before deploying.

Verify `dist/index.html` exists after the build.


---

## Important app-specific notes

- Local persistence key: the app saves a compact snapshot under the localStorage key `dartrack_saved_game` and discards snapshots older than ~3 hours.
- Hold hint: a small speech-bubble hint appears 5 seconds after starting a new game, anchored above the numeric `3` button; any interaction with the grid closes it. The hint fade-in/out is implemented so it animates on show/hide.
- Throws are stored as objects like `{ score: number, type: string | null }` (where type can be `'single'|'double'|'triple'|'BULL'|'CHERRY'|'MISS'|'BUST'` etc.)

Files of interest:
- `src/context/GameContext.jsx` — core game logic and actions (addThrow, undoLastThrow, undoBust, confirmEndTurn, persistence)
- `src/components/ButtonGrid.jsx` — numeric keypad and multiplier popup behavior (pointer handling, long-press)
- `src/components/HoldHint.jsx` — the hold-to-open hint bubble
- `src/components/ScoreBoard.jsx` — displays player score and throws
- `src/pages/GamePage.jsx` — layout and mounting point for header/modals

---

## Development notes & contributors

- The app is intended for quick touch-first input on phones but supports desktop as well.
- Key UX decisions (hold-to-open multiplier, hold-and-drag selection, undo semantics) are implemented in `GameContext` and `ButtonGrid`.


