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
- Production dependencies only: `@electron-toolkit/utils`, `electron-updater` and `ffmpeg-static`.

Next to it, in the app's `resources` folder:

- `app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe`: ffmpeg (about 80 MB, the biggest part).
  A program can't run from inside `app.asar`, so it's unpacked. `render.ts` points to it.
  Only the Windows ffmpeg is installed, so only that one ships.
- `templates/<id>/template/`: what a job copies. `sample-job/` and `examples/` stay out (dev only).
- `music/`, `sfx/` and `CREDITS.md`: the songs and sound effects (about 36 MB).
- `licenses/`: FFmpeg is GPL, so its license (`ffmpeg.exe.LICENSE`), build notes (`ffmpeg.exe.README`)
  and `FFMPEG.md` (what it is and where to get its source) ship with the app. The license and
  build notes also sit next to `ffmpeg.exe` in `app.asar.unpacked`. Both come from `ffmpeg-static`,
  so they always match the ffmpeg that ships. If you update `ffmpeg-static`, update the version
  and source link in `resources/licenses/FFMPEG.md`.

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

## Auto updates

The installed app checks for a newer version by itself (`src/main/updates.ts`, using `electron-updater`):

1. About 5 seconds after Wrenn opens, it looks at the latest GitHub Release of `lianxxxx/wrenn`
   (the `publish` part of `electron-builder.yml`).
2. If that release has a higher version, it downloads it in the background.
3. When it's downloaded, a small banner says "A new version of Wrenn is ready. Restart to update."
   "Restart" installs it and opens Wrenn again. "Not now" hides it, and the update installs the next
   time Wrenn is closed. The banner never shows while a video is being made.

If anything goes wrong (offline, the repo is private, no releases yet), it's only written to the log.
No pop ups, no crash. It never runs in `npm run dev` or in the tests.

### Making a release (by hand for now)

1. Raise `version` in `package.json` (for example `0.1.0` to `0.2.0`). The app only updates to a higher version.
2. `npm run dist`. It never uploads anything by itself (`--publish never`, and there's no token).
3. On GitHub, make a new Release in `lianxxxx/wrenn` with the tag `v0.2.0` (a `v` and the same version),
   and upload these three files from `dist/`:
   - `Wrenn-Setup-0.2.0.exe`: the installer
   - `Wrenn-Setup-0.2.0.exe.blockmap`: lets the app download only the parts that changed
   - `latest.yml`: tells the app which version is newest and where the installer is
4. Publish the release (not a draft, not a pre-release). Installed apps pick it up the next time they open.

The repo has to be public for this to work: the app reads releases without signing in to GitHub.

### Unsigned updates

The app isn't code signed, so `electron-builder.yml` sets `win.verifyUpdateCodeSignature: false`.
electron-updater only checks an update's signature when `app-update.yml` (written by the build)
has a `publisherName`, and that only gets filled in when the app is signed. So unsigned updates
install fine now. Once Wrenn is signed, remove that line so updates must be signed by the same publisher.

## Icon

`resources/icon.png` (1024 px) is a placeholder from Lian. electron-builder turns it into the
`.exe` and installer icon. Swap the file to change the icon, no config change needed.
