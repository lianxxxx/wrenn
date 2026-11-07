# Wrenn desktop app

Electron + React + TypeScript + Vite + Tailwind app, set up the electron-vite way. The `engine/` folder holds the HTML to MP4 render engine (its own package).

## Run it

```
npm install
npm run dev
```

## Where things are

- `src/main/`: the Electron window (size, what it loads).
- `src/preload/`: the bridge between the window and the computer. Empty for now.
- `src/renderer/`: the app screens (React).
  - `src/App.tsx`: picks which screen shows.
  - `src/screens/`: one file per screen.
  - `src/components/`: shared pieces (buttons, pickers, upload boxes).
  - `src/data.ts`: the fake data (sizes, templates, vibes).
  - `src/assets/main.css`: fonts, brand tokens (from `../brand/tokens.css`), dark mode.

Everything uses fake data for now: no Claude Code, no rendering, no file saving.
