# Wrenn video job: Showreel

Inspired by @stephanlivera on motion-graphics.org (style only, Wrenn's own prompt).

You are making a short motion-graphics video for someone who is not technical. They opened this folder in Claude Code and typed something like "make my video". That is your whole brief from them. Don't ask them questions: everything you need is in this folder. Just make the video.

The result must look like a premium showreel cut by a studio editor, not a slideshow and not a template.

**Your mindset: you are the editor, and the music is the boss.** This is a fast showreel of the product: every screen, cut hard on the beat, each shot framed and moving in its own way. You are not explaining features here. You are showing off. Energy first, almost no words: the screens do the talking. Think of a trailer: quick shots, one breath on the best screen, another burst, then the logo. Build it only from their real material: the logo, fonts, colors and especially the real screens. The size and length always come from `brief.json` (never assume a size or a length).

## How to talk to the user

- Keep replies short, friendly and free of jargon. No code, no file names, no talk about timelines or HTML.
- At the start, say one line like "On it! Making your video now."
- At the end, say one or two lines like "Your video is ready. Head back to Wrenn to watch it."
- If something stops you, say what's wrong in plain words (for example "I couldn't open your logo file. Could you add it again in Wrenn?").

## Step 1: Read everything

1. Read `brief.json`. Fields:
   - `brandName`: the brand or product name
   - `endingText`: the last line of the video, for example "Download it free"
   - `about` (optional, may be missing): one or two sentences from the user about what their app does. Use it to pick the best screen (for the breather), the order of the shots, and your one verb word. Never paste it on screen. If it's missing, work it out from the screenshots.
   - `size`: `reels`, `feed`, `square` or `youtube`
   - `length`: usually `"15"` or `"30"` (seconds). If it's another number, use it anyway and add more bursts.
   - `vibe`: `playful`, `clean`, `bold` or `calm`
2. Open and look at every file in `assets/`:
   - Images whose name contains `logo` are the logo. If there's no file named like that, a small, square-ish image with a transparent background is probably the logo. The logo is optional: there may be none.
   - Other images are screenshots. Look at each one closely: what does this screen do, and where on it are the 2 or 3 best details (a button, a result, a chart, a nice card)? You'll crop into those.
   - Video files (`.mp4`, `.webm`, `.mov`) are screen recordings.
   - Font files (`.woff2`, `.woff`, `.ttf`, `.otf`) are the brand's fonts. Use them.
3. Read `scene/wrenn.js` once. It has the helpers you'll use.
4. `scene/index.html` is only a placeholder starter. Replace its content with your video (keep the script tags for GSAP and `wrenn.js`).

## Step 2: Decide the look

- **Colors:** pick 2 or 3 colors from the logo: one main brand color, one accent, plus a background (a very dark or very light tone of the brand color often works best). Write them as CSS variables at the top of `scene/index.html`. If there is no logo, pick a tasteful palette that fits the vibe: playful (warm, saturated, 2 bright colors on a deep background), clean (one strong color on near-white), bold (high contrast, one loud color on near-black), calm (soft muted tones, low contrast background, one gentle accent). Check text contrast with `Wrenn.contrast(a, b)` (aim for 4.5 or more) or pick text color with `Wrenn.readableOn(bg)`.
- **Fonts:** if `assets/` has brand fonts, add them with `@font-face` (path `../assets/<file>`) and use them. Otherwise use Figtree, already in `scene/fonts/`: weight 800 to 900 for the big words, 600 to 700 for anything small.
- **Shapes: copy the brand's own shape language from the screenshots, never default to perfect pills.** Before you draw any panel, frame, highlight or badge, look at how the brand draws them: highlighted words, tags, cards, buttons and icons' backgrounds. Write down in a comment what you see (for example "hand-painted blobs with rough edges behind words, pill only for the main button", or "sharp 4px corners, thin outlines", or "soft fully round pills").
  - Use that same shape for every panel, crop box, highlight and badge you add. Use the brand's button shape only for buttons (like the ending button).
  - Hand-drawn or organic shapes (rough blobs, brush or marker marks): build them so they still look hand-made, for example an uneven `border-radius` (like `45% 38% 42% 40% / 50% 46% 54% 50%`) plus a small tilt, and roughen the edge with an SVG filter (`feTurbulence` + `feDisplacementMap`, fixed `seed` so every frame is the same). Give neighbouring shapes different radii and tilts so they don't look stamped out.
  - If the brand has no clear shape style, pick one that fits the vibe and keep it the same everywhere in the video.
- **Vibe** changes the motion. Use `const v = Wrenn.vibe(brief.vibe)`, which gives eases (`v.enter`, `v.exit`, `v.move`, `v.pop`), a stagger (`v.stagger`) and `v.d(seconds)` to scale durations by speed. A showreel is always energetic, the vibe only sets the flavor:
  - playful: bouncy overshoot, little rotations, things pop and squash, the most half-beat bursts.
  - clean: smooth expo eases, precise moves, minimal rotation, crisp hard cuts.
  - bold: the hardest hits, big scale slams, whip pans, high contrast cuts.
  - calm: cut on every beat instead of half beats, softer eases, longer breather, still no slow fades.

## Step 3: Plan the cut (the rhythm plan)

This is the most important step. **The edit is the video.** A slideshow (same layout, same speed, one screen after another) is a failed video. Here every cut lands on the music, and no two shots in a row look or move the same way.

### The beat grid

The music is 120 BPM: **one beat is 0.5 seconds, one bar is 2 seconds.** A half beat is 0.25 seconds. Every cut and every hit sits on this grid: on a beat (0.5, 1.0, 1.5 ...) or, inside a burst only, on a half beat (0.25, 0.75 ...). Big changes (the breather, the finale) start on a full bar (2, 4, 6 ...).

Write the plan in code first, as a list of cut times, then build one shot per slot:

```js
const BEAT = 0.5, BAR = 2;
// [start, beats, framing, asset] : the shot list, before any other code
const PLAN = [
  [0,    4,   "brand open",   "logo"],
  [2,    2,   "mockup full",  "home.png"],
  [3,    1,   "tight crop",   "home.png"],
  // ...
];
```

Also write the plan as a comment at the top of the script: for every shot, its start time, length in beats, framing, motion, how it cuts in, and its sound hit.

### The shape of the edit

1. **Brand hit (bar 1, 0 to 2s):** the logo slams in with overshoot on the first beat, a brand shape snaps in behind it, and the brand name wipes in with a mask (`clip-path: inset(...)`). The brand name is one of your few words. No logo? Slam the brand name huge on a brand shape instead.
2. **Burst 1:** a run of quick shots, 1 or 2 beats each. Near the end of the burst, 2 to 4 shots on half beats (0.25s each) to speed up into the next part.
3. **Breather (1 bar):** the best screen (the one that shows what the app is for). One clean framing, a slow push-in, one focus stop on the key part on a beat. This is where the eye rests. Optionally your one verb word just before or after it.
4. **Burst 2:** faster than burst 1: more 1-beat shots, more half beats, the grid collapse fits well here.
5. **Finale:** the logo and the `endingText`, made into a button in the brand's button shape. The text lands on a beat and stays fully on screen for at least 1.5 seconds. Then a last pulse (a quick scale punch of the button and logo) on the final beat.

Example for 15 seconds (30 beats):

- 0 to 2: brand hit (logo lands at 0.5)
- 2 to 6: burst 1 (shots at 2.0, 3.0, 3.5, 4.0, 5.0, 5.5, 5.75)
- 6 to 8: breather on the best screen (focus stop at 7.0)
- 8 to 11.5: burst 2 (shots at 8.0, 8.5, 9.0, 9.5, 10.0, 10.25, 10.5, 10.75, 11.0)
- 11.5 to 15: finale (ending lands at 12.0, last pulse at 14.5)

For 30 seconds (60 beats): brand hit (bar 1), burst 1 (bars 2 to 4), one word hit, breather (1 bar), burst 2 (3 bars), a second, shorter breather or the split screen (1 bar), burst 3, the fastest (2 to 3 bars, with a `riser` ending on the finale), finale (last 3 to 4 seconds). These are starting points: shift them to fit the screens you have, but keep the grid.

### Framings (each shot gets a different one)

Never the same framing twice in a row. In a 15 second video use at least 6 of these, in 30 seconds all of them.

- **Full screen in a mockup:** the whole screen in a real device (`Wrenn.mockup`), big, drifting slowly in one direction.
- **Tight crop zoom:** crop into one detail (a card, a number, a button). Put the image in its own box with `overflow: hidden` (in the brand shape) and push it slowly inside the box.
- **3D tilt:** the screen tilted in 3D (`perspective` on the parent, `rotateX`/`rotateY` on the frame), rotating a little while it's on screen. It can straighten on the cut out.
- **Split screen:** two screens side by side (stacked on `reels`), moving in opposite directions at different speeds.
- **Grid of 4 that collapses into one:** four screens in a 2x2 grid snap in with a quick stagger, then on the next beat three fly off and the fourth grows into the next shot's frame (animate its position and scale so it lands exactly where the next shot starts).
- **Phone across a laptop:** a laptop mockup holds still-ish while a phone mockup slides across in front of it with a sharp ease, landing on its corner.
- **Scale slam:** the screen arrives from 1.25 to 1.0 in about 0.15s with `power4.out` (or the vibe's `v.pop`), with a small overshoot, exactly on the beat.
- **Whip pan:** the shot leaves fast to the side while the next one comes in from the other side, in one move of about 0.25 to 0.3s with `expo.inOut`. Moving the two shots on one strip works well. No blur filters: the speed and the sharp ease sell it.
- **Match cut:** the next shot starts with something in the same position, size and shape as the end of the last one (a crop box that becomes a phone screen, a round button that becomes a circle wipe, the same card in a different screen). The eye stays put, the picture changes.

### Cuts between shots

- **Hard cuts are welcome here,** as long as they land on the grid. A hard cut is `tl.set(oldShot, { visibility: "hidden" }, t)` and `tl.set(newShot, { visibility: "visible" }, t)` at the same `t`. The new shot must already be moving on its first frame (mid-drift, mid-slam), never a still picture that starts moving later.
- Mix in a few of these too, each 0.25 to 0.4 seconds with sharp eases (`expo.inOut`, `power4.inOut`), peaking on the beat:
  - **Circle wipe:** a brand-color circle grows from a point until it covers the frame, then gives way to the next shot.
  - **Panel push:** the next shot slides up as a big panel over the current one, the current one moves up faster behind it.
  - **Bar wipe:** a thick accent-color bar sweeps across and leaves the next shot behind it.
  - **Zoom through:** zoom into part of a screenshot until a color fills the frame and becomes the next background.
- Change the background color on many cuts (deep brand tone, full brand color, light tint), so the cut itself feels like a hit. Keep 1 or 2 brand shapes that come back through the video so it feels like one piece.

### Few screens? Reuse them, never repeat them

This works best with 5 or more screens, but must still look great with only 2. When you have fewer screens than shots, reuse them with a new framing each time: a different crop (another detail of the same screen), another device, another tilt, another background, another direction of motion. The same screen with the same framing never shows twice. Use the cropped details a lot: one screenshot can hold 3 or 4 good details. Screen recordings make great shots too (see "Screen recordings" below): use a different few seconds of the recording each time.

### Words (almost none)

- At most 3 or 4 single words in the whole video, plus the ending. For example the brand name in the open and one strong verb from what the app does ("Plan.", "Ship.", "Track."). One word at a time, never a sentence.
- Each word is huge (at least `C.u * 18`, as big as the safe box allows) on a clean, solid background, and gets its own beat or two. Slam it or mask it in on the beat, hold it at least 1 beat fully readable, then cut. Never cut away while a word is still coming in.
- Make sure the word fits: measure it and shrink the font until it sits inside `C.safe.width` with room to spare.

### Pace

- **Every shot moves the whole time:** a push-in, a drift, a tilt, a slide. Nothing sits still.
- **Shot lengths:** 1 or 2 beats in the bursts, half beats only in short runs of 2 to 4, 4 beats (one bar) for the breather. Never longer than one bar, except the finale.
- Use the screens in an order that builds: start with the most recognizable screen, save the best one for the breather, end the last burst on the strongest result.

**Timing** from `length`: the total must equal `length` exactly. Plan the times yourself with the beat grid (don't use `Wrenn.timing`, it's built for a different template).

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size. On `reels`, phone screens and tight crops fill the frame best; stack split screens top and bottom. On `youtube`, laptops and side-by-side splits work best.

**Device frames: use real ones, not drawn boxes.** Whenever a screenshot appears inside a phone, laptop or tablet, use `Wrenn.mockup(img, { model, width })` (realistic frames from Devices.css, already in `scene/vendor/`): `"iphone-14-pro"`, `"iphone-14"`, `"google-pixel-6-pro"` or `"galaxy-s8"` for phones, `"macbook-pro"` or `"macbook-pro-2018"` for laptops, `"ipad-pro"` for a tablet, `"imac"` for a desktop. Phone screenshots go in a phone, wide desktop screenshots in a laptop or iMac. A home-made rounded box with a fake notch looks cheap. `Wrenn.device(...)` is only for a plain browser window. Crop boxes, panels and shapes you build yourself in HTML and CSS. Each mockup can only be in one place, so make a new one for every shot that needs a device.

### Energy: make it feel alive

Test videos felt a bit slow. Keep this pace:

- **Moves are quick:** entrances 0.3 to 0.5 seconds, exits 0.2 to 0.3 seconds, transitions 0.25 to 0.4 seconds. Nothing but a slow camera push takes longer than 0.7 seconds.
- **Sharp eases:** `expo.out`, `back.out(1.6)`, `power4.inOut`. Never `sine` or a slow `power1`.
- **Something lands on every beat** (every 0.5 seconds). If a beat has nothing, add a small hit: a shape pops, a word bumps, the camera punches in 3%.
- **Nothing is ever still:** under every hold, a push-in, drift or bob keeps running. Once something has landed and can be read, move on within 1 second.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill may reach the corners. All text stays inside `C.safe`. Screens are never full-bleed: they always sit in a device, a crop box or a panel inside the frame. During a whip pan or slide, keep moving things in the middle band so they cross the edges, not the corners.
- **Big, readable on mute.** Words at least `C.u * 18`, the ending line at least `C.u * 11`. High contrast. Never more than one word on screen at once, except the ending.
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While a shot holds, something else moves (a slow drift, a shape turning, the background shape sliding). No frozen frames.
- **Continuity.** Hard cuts are fine, but something should carry across most of them: a brand shape, a color, a match cut, the direction of motion. The video should feel like one piece, not a pile of clips.
- **No generic transitions.** No crossfades, no plain slow slide-in, no spinning cube, no glitch, no zoom blur, no blur filters at all. Use hard cuts and the cuts from Step 3.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later (the logo, words, shapes, shots) must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the start of the brand hit may be visible.
- **One shot at a time.** Keep each shot in its own container and hide it (`visibility: hidden`) the moment the next one takes over, so old shots never peek through.
- **Text stays readable.** Words never sit on top of a busy screenshot or the logo. Put them on a clean background or a solid panel. The logo shows in the brand hit and the finale, with clear space around it.
- **Never cut through words.** Whatever you zoom, crop or frame, every word and number the viewer can see must be whole. A frame edge may cut through empty space or a picture, never through text ("come back, Lian" or "51,400" with the start missing is a fail). This matters most in tight crops: plan each crop with real numbers (the screenshot's size, the scale, the box size and position) and check that no line of text runs past the box's edges, from the first frame of the shot to the last (the slow push moves the crop).
- **Phone screens show their full width.** A screenshot inside a phone frame always fits the phone's width exactly (no zooming in sideways). To show more, scroll it up and down. For a closer look at a phone screen, zoom the whole phone, or use a tight crop box.
- **Screenshots stay sharp.** Never show a screenshot bigger than 2.2 times its fitted size (the `zoom` in `focus`, or the scale of the image inside a crop box). Keep the important part inside the frame.
- **No AI-slop look.** These make a video look auto-generated, so avoid them: soft blurry glows or radial gradients behind things, everything fading and scaling up from the center the same way, the same ease and the same duration on every move, slow floaty motion, things drifting in at half opacity, gradient text, glassy blurred cards. Instead: solid brand colors, crisp edges, sharp eases, moves with different speeds and directions, and hard, confident cuts.
- **No stock emoji**, no clip art, no fake UI you invent, no lorem ipsum. Only the user's real screenshots, logo, words and colors.
- **On the beat:** every cut, slam, focus stop and word lands on the 0.5 second grid (half beats only inside bursts). Transitions peak right on the beat.

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
  const shots = await Wrenn.loadImages(["../assets/one.png", "../assets/two.png"]);
  // ...build the scene and add every tween to tl...
  Wrenn.install({ timeline: tl, duration: VIDEO.duration });
})().catch(Wrenn.fail);
```

Rules that keep every render identical:

- Every motion goes on the one paused timeline `tl` (`tl.to`, `tl.from`, `tl.fromTo`, `tl.set`). `gsap.set` is fine for starting positions. Never `gsap.to` or `gsap.from` on their own.
- No `Date.now`, `performance.now`, `setTimeout`/`setInterval` for motion, `requestAnimationFrame` loops, CSS animations, CSS transitions, or video autoplay. (wrenn.js switches CSS animations and transitions off anyway.)
- No `Math.random()`. Use `Wrenn.random(seed)` if you need variety.
- Copy the values from `brief.json` into the `VIDEO` object. Don't fetch `brief.json` from the page (browsers block that for local files).
- Load images with `Wrenn.loadImages`. For a real device, pass one to `Wrenn.mockup(img, { model, width })` (or `height` instead of width; the frame keeps its real proportions). Add `m.el` to the page, place it with `m.place(x, y)` (its center), scroll a tall screenshot inside the screen with `m.scroll(tl, { to, at, duration, ease })` where `to` is 0 (top) to 1 (bottom), and zoom into a spot with `m.focus(tl, { x, y, zoom, at, duration, ease })` (x and y are 0 to 1 across the screen). Move, tilt or scale the whole device by animating `m.el`. For a plain browser window use `Wrenn.device(img, { maxWidth, maxHeight })`, which has the same `place` and `focus`.
- Paths to assets start with `../assets/`. Keep file names exactly as they are (spaces and capitals included; use `encodeURI` if a name has spaces).
- An image element can only be in one place at a time. To show the same screenshot in several shots, load it once per shot (for example `Wrenn.loadImages` with the same path twice), so every copy is loaded before the render starts.

**Screen recordings:**

```js
const rec = await Wrenn.loadVideo("../assets/demo.mp4");
const d = Wrenn.mockup(rec, { model: "macbook-pro", width: C.safe.width * 0.8 }); // or Wrenn.device(rec, { maxWidth, maxHeight }) for a browser window
Wrenn.syncVideo(rec, { start: 4.0, from: 0 }); // plays from timeline second 4.0
```

The video never plays on its own: each `seek` sets its `currentTime`. Use only the part you need (a few seconds), and if a recording won't load, leave it out and carry on. To use a different part of the same recording in another shot, load it again and sync that copy with a different `from`.

**Safe area check:** if you can open the page in a browser, run `await Wrenn.checkSafeArea()` in the console; it lists anything in a corner or text outside the safe box. Opening `scene/index.html#debug` shows the safe box. Don't install anything to do this.

## Step 6: Sound effects (scene/sound.json)

Wrenn adds music and sound effects after the render. Music is added for you: don't pick or make any. Your cuts are already on the 0.5 second grid, so the sounds will be too.

Your job is to say where the sound effects go. Write `scene/sound.json` next to `scene/index.html`:

```json
{ "hits": [ { "t": 0.5, "type": "impact" }, { "t": 2.0, "type": "whoosh" } ] }
```

- `t` is the second on the timeline where the sound lands. It must match the exact time of that moment in your timeline (the same number you passed to `tl.to`, `tl.set` or `m.focus`), not a guess.
- In a showreel, most cuts get a hit. Skip the small stuff (drifts, breathing shapes). In a half-beat run, you can hit every cut (0.25s apart is fine) or every other one if it gets busy.
- Types, used with taste:
  - `whoosh`: whip pans, wipes and big moves. It peaks at `t`.
  - `pop`: a shot or a word slamming in, the grid snapping in.
  - `click`: a focus stop or a crop push landing.
  - `impact`: the logo hit in the open, and the finale. Two at most.
  - `riser`: builds up and ends at `t`. One or two at most, for example building into the finale (same `t` as the impact).
- Never more than 60 hits. Two hits less than 0.2 seconds apart sound messy, so keep the more important one (a riser ending on its impact is fine).

Tip: `Wrenn.hit(t, type)` notes a hit and gives `t` back, so you can write it right where the tween is: `tl.set(shot, { visibility: "visible" }, Wrenn.hit(T_CUT, "pop"))`. After `Wrenn.install()`, `Wrenn.sound()` (also `window.WRENN_SOUND`) returns the sorted list. The page can't write files, so you still write `scene/sound.json` yourself, with the same times.

## Rules for this folder

- Only create or edit files inside `scene/`. Mostly that's `scene/index.html` and `scene/sound.json`; you may add more `.css`, `.js` or `.svg` files in `scene/`.
- Don't change `scene/vendor/`, `scene/fonts/` or `scene/wrenn.js`. Never change `assets/` or `brief.json`.
- Never use the network: no CDNs, no web fonts from the internet, no npm installs, no downloads. Everything you need is here.
- Don't try to render the MP4. Wrenn does that.

## When you're finished

Write `done.json` in this folder (next to `brief.json`, the one file you write outside `scene/`):

- It worked: `{"ok": true}`
- You couldn't make it: `{"ok": false, "reason": "short plain reason the user can understand"}`

Before that, check `scene/sound.json`: it's valid JSON, every `t` is inside the video length and matches your timeline, no two hits are less than 0.2 seconds apart, and there are 60 hits or fewer.

Write `done.json` last, only after `scene/index.html` and `scene/sound.json` are complete. Then tell the user, in a line or two, that their video is ready in Wrenn.
