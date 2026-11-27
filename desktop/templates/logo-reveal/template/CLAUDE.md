# Wrenn video job: Logo reveal

Inspired by @tdinh_me on motion-graphics.org (style only, Wrenn's own prompt).

You are making a short motion-graphics video for someone who is not technical. They opened this folder in Claude Code and typed something like "make my video". That is your whole brief from them. Don't ask them questions: everything you need is in this folder. Just make the video.

The result must look like a premium logo sting made by a studio, not a logo that fades in and sits there.

**Your mindset: the logo builds itself.** The whole video is one idea: the logo's own parts fly in, click together and land as the mark, then the name and the tagline join it. Every piece you move must come from the logo itself (its shapes, its colors, its letters), never from random decoration. The size and length always come from `brief.json` (never assume a size or a length).

## How to talk to the user

- Keep replies short, friendly and free of jargon. No code, no file names, no talk about timelines or HTML.
- At the start, say one line like "On it! Making your video now."
- At the end, say one or two lines like "Your video is ready. Head back to Wrenn to watch it."
- If something stops you, say what's wrong in plain words (for example "I couldn't open your logo file. Could you add it again in Wrenn?").

## Step 1: Read everything

1. Read `brief.json`. Fields:
   - `brandName`: the brand or product name. It sits next to or under the mark in the final lockup.
   - `endingText`: here this is the tagline, for example "Sound you can see". It shows under the lockup and holds at the end.
   - `about` (optional, may be missing): one or two sentences from the user about what they do. Use it only to feel the brand's mood. Never put it on screen.
   - `size`: `reels`, `feed`, `square` or `youtube`
   - `length`: always `"15"` (seconds) for this template
   - `vibe`: `playful`, `clean`, `bold` or `calm`
2. Open and look at every file in `assets/`:
   - Images whose name contains `logo` are the logo. If there's no file named like that, a small, square-ish image with a transparent background is probably the logo. **The logo is the main material of this video.**
   - Font files (`.woff2`, `.woff`, `.ttf`, `.otf`) are the brand's fonts. Use them.
   - Other images (screenshots) are not needed here. Ignore them, or use at most one, once, as a quiet background moment (dimmed, behind a solid color panel, never next to the logo).
3. Read `scene/wrenn.js` once. It has the helpers you'll use.

## Step 2: Study the logo, then decide the look

**Take the logo apart first.** Look at it closely and write down in a comment what it is made of: how many shapes, which colors, any letters, where the mark ends and the wordmark starts, round or sharp, thick or thin. This list is your cast of pieces.

How to get the pieces, best first:

- **SVG logo:** read the file and copy its markup into `scene/index.html` (inline `<svg>`). Now every `<path>`, `<circle>` and group is a piece you can move on its own. Don't change the shapes, only animate them.
- **PNG or JPG you can't split:** slice the image. Stack 3 to 6 copies of the logo `<img>` in exactly the same spot, and give each copy a different `clip-path` (`polygon(...)` or `inset(...)`) so each shows one part (along the real edges of the shapes where you can). Fly each slice in from a different place: when they all land, the logo looks whole again.
- **Or rebuild it:** draw matching shapes in HTML or SVG in the exact brand colors (the circle, the bar, the leaf) that fly in and become the logo, then the real logo image takes over on the landing frame (cut on the impact, never a crossfade).
- **No logo file?** The letters of `brandName` are the pieces. Split the name into letters, scatter them, and assemble them into the wordmark, with one brand shape (a bar, a dot, a circle) as the mark.

Then:

- **Colors:** pick 2 or 3 colors from the logo: one main brand color, one accent, plus a background (a very dark or very light tone of the brand color often works best). Write them as CSS variables at the top of `scene/index.html`. If there is no logo, pick a tasteful palette that fits the vibe: playful (warm, saturated, 2 bright colors on a deep background), clean (one strong color on near-white), bold (high contrast, one loud color on near-black), calm (soft muted tones, low contrast background, one gentle accent). Check text contrast with `Wrenn.contrast(a, b)` (aim for 4.5 or more) or pick text color with `Wrenn.readableOn(bg)`. Make sure the logo itself stands out on the background you pick.
- **Fonts:** if `assets/` has brand fonts, add them with `@font-face` (path `../assets/<file>`) and use them. Otherwise use Figtree, already in `scene/fonts/`: weight 800 to 900 for the brand name, 600 to 700 for the tagline.
- **Shapes: copy the logo's own shape language, never default to perfect pills.** Any extra shape you add (a sweep, a bar, a burst ring) uses the logo's corners, stroke weight and curves. Write down in a comment what you see (for example "thick round strokes, no sharp corners" or "sharp 45 degree cuts").
  - Hand-drawn or organic logos: build extra shapes so they still look hand-made, for example an uneven `border-radius` (like `45% 38% 42% 40% / 50% 46% 54% 50%`) plus a small tilt, and roughen the edge with an SVG filter (`feTurbulence` + `feDisplacementMap`, fixed `seed` so every frame is the same).
- **Vibe** changes the motion. Use `const v = Wrenn.vibe(brief.vibe)`, which gives eases (`v.enter`, `v.exit`, `v.move`, `v.pop`), a stagger (`v.stagger`) and `v.d(seconds)` to scale durations by speed.
  - playful: bouncy overshoot, faster, little rotations, pieces pop and squash as they land.
  - clean: smooth expo eases, precise, minimal rotation, pieces glide in along straight lines.
  - bold: fast and punchy, hard snaps on the beat, strong scale hits, a big impact.
  - calm: slower, soft eases, gentle drift, small overshoot only.

## Step 3: Plan the reveal

Before writing any code, write a shot list as a comment at the top of the script: every piece, where it starts, when it lands, and every hit, with exact times. Then build it.

The video is 15 seconds: 30 beats of 0.5 seconds. Three acts:

### Act 1: Assemble (about 0 to 4.5 seconds)

- Start with something already moving on frame 1: a piece entering, a shape sweeping, never an empty still frame.
- The pieces fly in one by one, each landing on a beat (0.5, 1.0, 1.5 ...). Give them different paths: one drops from above, one slides in rotating, one scales up from a point. Each landing overshoots a little and settles. Later pieces can nudge the ones already there (a small push, a squash), so they feel like they touch.
- **The mark lands with an impact** (around 2.5 to 3.5 seconds, on a beat): the last piece clicks in, the whole mark punches (scale up about 8% for 0.1 seconds and back), and something answers it: a ring in the accent color bursts out and is gone, or the background flips to another brand tone in one frame.
- **The brand name wipes in** right after, through a mask (`clip-path: inset(...)` growing from the mark's side, or each letter rising out of a box with `overflow: hidden`). It comes from the mark, as if the mark pushed it out.

### Act 2: Play with it (about 4.5 to 12.5 seconds)

The lockup is built. **This act is where most videos go dead, so it must be the busiest part.** One new moment on every bar (every 2 seconds), at least 4 different ones, never two of the same in a row:

- **The lockup shifts:** the mark slides from center to the side (or up) and the name settles next to (or under) it, a clean re-layout with a sharp ease.
- **Shape sweep:** a big brand shape (from the logo) sweeps across behind the lockup and changes the background color as it passes.
- **Take apart and rebuild:** the pieces of the mark burst out a little (or flip, or swap places) and snap back together on the next beat.
- **Big close-up:** the camera punches in on one piece of the mark until it fills a third of the frame, then pulls back out.
- **Pattern:** copies of the mark (or one of its pieces) tile or stream across the background in a brand tone, then clear away.
- **Tagline line by line:** `endingText` reveals under the lockup, one line at a time, rising out of a mask.
- **Echo:** an outline copy of the mark scales out from behind it and is gone.

Something small also keeps moving between the moments: a push-in, a piece bobbing on the beat, a shape drifting. Nothing on screen is ever still for more than half a second.

### Act 3: The end (the last 2.5 seconds)

- The final lockup: mark + `brandName` + `endingText` as the tagline, clean, with lots of space around it. Fully on screen for the last 2 to 2.5 seconds (not longer: a long still ending feels dead).
- It still moves: a steady push-in (scale 1 to 1.06), and the mark's pieces bob once on each beat, small.
- **One last pulse on the final beat** (about 0.5 to 1 second before the end): the mark punches once, small and confident.

**Speed:** moves take 0.25 to 0.5 seconds, never longer than 0.7 (except the slow push-ins underneath). Sharp eases (`expo.out`, `back.out`, `power4.inOut`), never slow floaty ones.

**Composition:** centered is fine for this template. Keep the whole lockup inside `C.safe` with clear space around it, and keep every piece out of the corners, even while it flies in (enter from the edges' middles, not from the corners).

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size. On `youtube` (landscape) put the name beside the mark; on `reels` stack the name under the mark.

**No device mockups** in this template. It's all logo, type and shapes.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill may reach the corners. All text stays inside `C.safe`.
- **Big, readable on mute.** The brand name at least `C.u * 11`. The tagline at least `C.u * 6.5`. The mark big: about 35 to 50% of the shorter side while it's alone, smaller once the name joins.
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While something holds, something else moves gently (a slow drift, a soft scale, a shape breathing). No frozen frames longer than half a second.
- **Continuity.** It's one shot, not scenes. The pieces never vanish and come back: they build the mark and stay in it. Color changes happen through a moving shape or on the impact, never as a hard reset.
- **No generic transitions.** No crossfades, no plain slide-in from the side, no spinning, no glitch, no zoom blur, no lens flare.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later (pieces, the name, the tagline) must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the first pieces may be visible.
- **The logo stays true.** When the pieces have landed, the mark must look exactly like the user's logo: same shapes, same colors, same proportions. Never stretch it, recolor it or crop it.
- **Text stays readable.** Text never sits on top of the logo or a busy picture. Clear space around the lockup.
- **No AI-slop look.** These make a video look auto-generated, so avoid them: soft blurry glows or radial gradients behind the logo, the logo fading and scaling up from the center, the same ease and the same duration on every move, slow floaty motion, things drifting in at half opacity, gradient text, light rays, particles. Instead: solid brand colors, crisp edges, sharp eases, moves with different speeds and directions.
- **No stock emoji**, no clip art, no lorem ipsum. Only the user's real logo, words and colors.
- **On the beat:** the music is 120 BPM, so one beat is 0.5 seconds and one bar is 2 seconds. Land every piece, the impact, the name and each tagline line on the 0.5 second grid. Big moments (the impact, the lockup shift) on a full bar (2, 4, 6 ...) when you can.

## Step 5: Technical contract (must follow exactly)

Wrenn renders the page frame by frame. It depends on this:

- The page sets `window.WRENN = { width, height, fps: 30, duration }` (duration in seconds).
- `window.seek(t)` sets the paused GSAP master timeline to time `t`. It may return a Promise; the renderer awaits it.
- `window.wrennReady` is a Promise that resolves once fonts and all images are loaded.

`Wrenn.install({ timeline: tl, duration })` does all three for you. Call it once, at the very end of your script. Keep the starter's shape:

```js
(async () => {
  const VIDEO = { size: "reels", duration: 15, vibe: "playful" }; // from brief.json
  const C = Wrenn.canvas(VIDEO.size);
  const v = Wrenn.vibe(VIDEO.vibe);
  const tl = gsap.timeline({ paused: true });
  await Wrenn.fontsReady();
  const [logo] = await Wrenn.loadImages(["../assets/logo.png"]);
  // ...build the scene and add every tween to tl...
  Wrenn.install({ timeline: tl, duration: VIDEO.duration });
})().catch(Wrenn.fail);
```

Rules that keep every render identical:

- Every motion goes on the one paused timeline `tl` (`tl.to`, `tl.from`, `tl.fromTo`, `tl.set`). `gsap.set` is fine for starting positions. Never `gsap.to` or `gsap.from` on their own.
- No `Date.now`, `performance.now`, `setTimeout`/`setInterval` for motion, `requestAnimationFrame` loops, CSS animations, CSS transitions, or video autoplay. (wrenn.js switches CSS animations and transitions off anyway.)
- No `Math.random()`. Use `Wrenn.random(seed)` if you need variety.
- Copy the values from `brief.json` into the `VIDEO` object. Don't fetch `brief.json` from the page (browsers block that for local files).
- Load images with `Wrenn.loadImages`. A loaded image can be added to the page and cloned (`img.cloneNode()`) for slices.
- Paths to assets start with `../assets/`. Keep file names exactly as they are (spaces and capitals included; use `encodeURI` if a name has spaces).

**Safe area check:** if you can open the page in a browser, run `await Wrenn.checkSafeArea()` in the console; it lists anything in a corner or text outside the safe box. Opening `scene/index.html#debug` shows the safe box. Don't install anything to do this.

## Step 6: Sound effects (scene/sound.json)

Wrenn adds music and sound effects after the render. Music is added for you: don't pick or make any. Keep your hits on a steady 0.5 second grid where you can (0.5, 1.0, 1.5 ...), so the video feels on the beat.

Your job is to say where the sound effects go. Write `scene/sound.json` next to `scene/index.html`:

```json
{ "hits": [ { "t": 0.5, "type": "pop" }, { "t": 3.0, "type": "impact" } ] }
```

- `t` is the second on the timeline where the sound lands. It must match the exact time of that moment in your timeline (the same number you passed to `tl.to` or `Wrenn.reveal`), not a guess.
- One hit for each moment that matters: each piece landing, the logo impact, the name wipe, each tagline line, the lockup shift, the last pulse. Skip the small stuff (drifts, breathing shapes, each single letter).
- Types, used with taste:
  - `whoosh`: big moves (a piece flying a long way, the shape sweep, the lockup shift). It peaks at `t`.
  - `pop`: pieces landing, the name and tagline appearing.
  - `click`: small precise snaps (a slice locking into place).
  - `impact`: the moment the mark lands. Once.
  - `riser`: builds up and ends at `t`. One, building into the impact (same `t` as the impact).
- Not too many: about one hit every 0.5 to 1.5 seconds. Never more than 60. Two hits less than 0.2 seconds apart sound messy, so keep the more important one (a riser ending on its impact is fine). The hold at the end stays quiet except for the last pulse.

Tip: `Wrenn.hit(t, type)` notes a hit and gives `t` back, so you can write it right where the tween is: `tl.to(mark, {...}, Wrenn.hit(T_LOGO, "impact"))`. After `Wrenn.install()`, `Wrenn.sound()` (also `window.WRENN_SOUND`) returns the sorted list. The page can't write files, so you still write `scene/sound.json` yourself, with the same times.

## Rules for this folder

- Only create or edit files inside `scene/`. Mostly that's `scene/index.html` and `scene/sound.json`; you may add more `.css`, `.js` or `.svg` files in `scene/`.
- Don't change `scene/vendor/`, `scene/fonts/` or `scene/wrenn.js`. Never change `assets/` or `brief.json`. (Copying an SVG logo's markup into `scene/index.html` is fine; the file in `assets/` stays as it is.)
- Never use the network: no CDNs, no web fonts from the internet, no npm installs, no downloads. Everything you need is here.
- Don't try to render the MP4. Wrenn does that.

## When you're finished

Write `done.json` in this folder (next to `brief.json`, the one file you write outside `scene/`):

- It worked: `{"ok": true}`
- You couldn't make it: `{"ok": false, "reason": "short plain reason the user can understand"}`

Before that, check `scene/sound.json`: it's valid JSON, every `t` is inside the video length and matches your timeline, and there are 60 hits or fewer.

Write `done.json` last, only after `scene/index.html` and `scene/sound.json` are complete. Then tell the user, in a line or two, that their video is ready in Wrenn.
