# FFmpeg

Wrenn uses FFmpeg to turn frames and sound into MP4 videos. It runs FFmpeg as a separate
program (`ffmpeg.exe`); Wrenn's own code is MIT licensed.

- Build: FFmpeg 6.1.1, 64-bit static Windows build ("essentials") from https://www.gyan.dev/ffmpeg/builds/
- How it got here: the `ffmpeg-static` npm package (https://github.com/eugeneware/ffmpeg-static), release b6.1.1
- License: GPL v3. The full text is in `ffmpeg.exe.LICENSE` in this folder.
- Build details (version, settings and included libraries): `ffmpeg.exe.README` in this folder.
- Source code: https://github.com/FFmpeg/FFmpeg/commit/e38092ef93 (the exact FFmpeg version of this build).
  All FFmpeg source: https://ffmpeg.org/download.html
