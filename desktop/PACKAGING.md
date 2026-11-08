# Packaging (Windows installer)

Wrenn is packaged with electron-builder. The settings live in `electron-builder.yml`.

## Build it

```
cd desktop
npm run dist
```

This runs the type check and `electron-vite build` first, then electron-builder.
The first run downloads Electron and NSIS, so it needs internet and takes a few minutes.

- `npm run dist`: makes the installer.
- `npm run pack`: only makes the unpacked app (faster, good for a quick test).

## Where it goes

Everything lands in `desktop/dist/` (ignored by git, never commit it):

- `dist/Wrenn-Setup-<version>.exe`: the installer to share. About 175 MB.
- `dist/win-unpacked/Wrenn.exe`: the app without installing. Run this to test a build.

The installer lets the user pick a folder, and adds a desktop shortcut and a Start menu shortcut.
It installs for the current user only, so it doesn't ask for admin rights.

## What gets bundled

Inside `app.asar` (the app's packed code, about 2 MB):

- `out/`: our built code (main, preload, screens). The dev-only `render-cli.js` is left out.
- `resources/icon.png`: the window icon.
- Production dependencies only: `@electron-toolkit/utils` and `ffmpeg-static`.

Next to it, in the app's `resources` folder:

- `app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe`: ffmpeg (about 80 MB, the biggest part).
  A program can't run from inside `app.asar`, so it's unpacked. `render.ts` points to it.
  Only the Windows ffmpeg is installed, so only that one ships.
- `templates/<id>/template/`: what a job copies. `sample-job/` and `examples/` stay out (dev only).
- `music/`, `sfx/` and `CREDITS.md`: the songs and sound effects (about 36 MB).

Only the English language pack from Electron is kept, which saves about 40 MB.

## Where the app saves things

- Settings and job folders: `%APPDATA%\wrenn` (the app name from `package.json`).
  Windows folder names ignore upper and lower case, so this is the same folder as `%APPDATA%\Wrenn`,
  and the same one `npm run dev` uses.
- Finished videos: `Videos\Wrenn`.

## SmartScreen warning

The app isn't code signed yet. When someone runs the installer, Windows SmartScreen shows
"Windows protected your PC". They click "More info", then "Run anyway".
This goes away once the app is signed with a code signing certificate.

## Icon

`resources/icon.png` (1024 px) is a placeholder from Lian. electron-builder turns it into the
`.exe` and installer icon. Swap the file to change the icon, no config change needed.
