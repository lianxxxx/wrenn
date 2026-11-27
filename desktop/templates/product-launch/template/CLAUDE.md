# Wrenn video job: Product launch

Inspired by @twoclipping on motion-graphics.org (style only, Wrenn's own prompt).

You are making a short motion-graphics video for someone who is not technical. They opened this folder in Claude Code and typed something like "make my video". That is your whole brief from them. Don't ask them questions: everything you need is in this folder. Just make the video.

The result is a launch trailer: a tiny keynote reveal for something new, made by a studio. Not a slideshow and not a template.

**Your mindset: this is the reveal.** Someone made something new and this video is the moment the world first sees it. Build tension, land the name like a drum hit, show the real product off in real devices, then leave the viewer with the name and one clear next step. The whole video is **one continuous take**: the camera never cuts away, every scene grows out of the one before it. Build it only from their real material: the logo, fonts, colors and especially the real screens. The size and length always come from `brief.json` (never assume a size or a length).

## How to talk to the user

- Keep replies short, friendly and free of jargon. No code, no file names, no talk about timelines or HTML.
- At the start, say one line like "On it! Making your video now."
- At the end, say one or two lines like "Your video is ready. Head back to Wrenn to watch it."
- If something stops you, say what's wrong in plain words (for example "I couldn't open your logo file. Could you add it again in Wrenn?").

## Step 1: Read everything

1. Read `brief.json`. Fields:
   - `brandName`: the brand or product name
   - `endingText`: the last line of the video, for example "Download it free"
   - `about` (optional, may be missing): one or two sentences from the user about what their app does. Use it to understand the product: pick which screenshots and features to highlight, in which order, and where to focus on each one. Use it to write the tease, the feature labels and the "what's new" words too, in your own short words (1 to 4 words each). Never paste it on screen as a sentence or a paragraph. If it's missing, work it out from the screenshots.
   - `size`: `reels`, `feed`, `square` or `youtube`
   - `length`: `"15"` or `"30"` (seconds). If it says something else, use that number: the total must still match it exactly.
   - `vibe`: `playful`, `clean`, `bold` or `calm`
2. Open and look at every file in `assets/`:
   - Images whose name contains `logo` are the logo. If there's no file named like that, a small, square-ish image with a transparent background is probably the logo.
   - Other images are screenshots (this template expects 2 to 4). Look at each one closely: what does this screen do, and where on it is the most important part (a button, a result, a chart)?
   - Video files (`.mp4`, `.webm`, `.mov`) are screen recordings. They are optional.
   - Font files (`.woff2`, `.woff`, `.ttf`, `.otf`) are the brand's fonts. Use them.
3. Read `scene/wrenn.js` once. It has the helpers you'll use.

## Step 2: Decide the look

- **Colors:** pick 2 or 3 colors from the logo: one main brand color, one accent, plus a background (a very dark or very light tone of the brand color often works best). Write them as CSS variables at the top of `scene/index.html`. If there is no logo, pick a tasteful palette that fits the vibe: playful (warm, saturated, 2 bright colors on a deep background), clean (one strong color on near-white), bold (high contrast, one loud color on near-black), calm (soft muted tones, low contrast background, one gentle accent). Check text contrast with `Wrenn.contrast(a, b)` (aim for 4.5 or more) or pick text color with `Wrenn.readableOn(bg)`. For this template, also pick a **night tone**: a near-black tinted with the brand color (`Wrenn.shade(brand, -0.85)` or similar). The open lives in it.
- **Fonts:** if `assets/` has brand fonts, add them with `@font-face` (path `../assets/<file>`) and use them. Otherwise use Figtree, already in `scene/fonts/`: weight 800 to 900 for big lines, 600 to 700 for labels.
- **Shapes: copy the brand's own shape language from the screenshots, never default to perfect pills.** Before you draw any chip, tag, label, highlight or badge, look at how the brand draws them: highlighted words, tags, cards, buttons and icons' backgrounds. Write down in a comment what you see (for example "hand-painted blobs with rough edges behind words, pill only for the main button", or "sharp 4px corners, thin outlines", or "soft fully round pills").
  - Use that same shape for every chip, label, highlight and badge you add. Use the brand's button shape only for buttons (like the ending button).
  - Hand-drawn or organic shapes (rough blobs, brush or marker marks): build them so they still look hand-made, for example an uneven `border-radius` (like `45% 38% 42% 40% / 50% 46% 54% 50%`) plus a small tilt, and roughen the edge with an SVG filter (`feTurbulence` + `feDisplacementMap`, fixed `seed` so every frame is the same). Give neighbouring chips different radii and tilts so they don't look stamped out.
  - If the brand has no clear shape style, pick one that fits the vibe and keep it the same everywhere in the video.
- **Vibe** changes the motion. Use `const v = Wrenn.vibe(brief.vibe)`, which gives eases (`v.enter`, `v.exit`, `v.move`, `v.pop`), a stagger (`v.stagger`) and `v.d(seconds)` to scale durations by speed.
  - playful: bouncy overshoot, faster, little rotations, things pop and squash.
  - clean: smooth expo eases, precise, minimal rotation, generous space.
  - bold: fast and punchy, big type, strong scale hits.
  - calm: slower, soft eases, gentle drift, small overshoot only.

## Step 3: Plan the launch (one take, no cuts)

This is the most important step. The feeling to aim for: a keynote reveal squeezed into a few seconds. The screen is always changing, but it never jumps. Think of it as one camera move and one shape that keeps turning into the next thing.

Before writing any code, write a shot list as a comment at the top of the script: for every beat, its time, what is on screen, **which shape or element carries over from the previous moment**, and its sound hit. If a moment has nothing carried over from the one before, rethink it. Then build it.

### The beats

1. **Tease (dark open, about 15% of the video):** start in the night tone, almost empty. One single thing in the brand color: a thin light line, a dot, a sliver of the logo's shape. It moves with intent: the line draws across, the dot pulses on the beat, a crack of brand color opens. Then 1 or 2 short tease lines rise out of a mask line, built from what the product is about (for example "Something new" or a 2 to 3 word hint from `about`). Avoid cliché words like "Introducing", "Coming soon" or "Get ready" if you can say it more specifically. Tension: small, slow, and then...
2. **Name reveal (the hit):** the line or dot from the tease becomes the reveal. It snaps open into a shape, or floods the frame with the brand color, and the logo lands with overshoot right on a bar (2.0, 4.0 ...). The brand name rises out of a mask beside or under it. This is the `impact` moment, with a `riser` into it.
3. **Hero features (2 to 4 moments, the middle):** the real screens in real devices (`Wrenn.mockup`, see below). Each moment shows one screen and one idea (a 1 to 4 word label). The first device grows out of the name reveal (for example the brand shape behind the logo contracts into the device's screen, or the logo shrinks into an icon on the first screen). Each next moment is made from the previous one: the camera zooms into part of the screen until it becomes the next frame, the phone turns and becomes a laptop's screen, the device slides aside and a second one comes up from where it went.
4. **What's new (quick-fire montage, 1.5 to 3 seconds):** a fast run of chips or words, one per beat or faster, naming what the product does (from `about` and the screens: "Dark mode", "Offline", "One tap export"). They pop in on a spring, stack, swap, light up in the accent color. Built from the last device: for example the last screen shrinks to a chip, or chips fly out of it.
5. **Finale (at least the last 2 seconds):** the chips gather into the logo, the logo and `brandName` settle, and the `endingText` appears as a button in the brand's button shape. A cursor glides to it and clicks (the button dips and springs back). Add a small "date or call to action" feel under it if it fits (a thin line, a short "Out now" style word only if `endingText` doesn't already say it). Hold the ending text fully on screen for at least 1.5 seconds, still breathing gently.

### How scenes turn into each other (morphs, not cuts)

There are no cuts in this video. Every change is one of these, and it starts from where the eye already is. Use at least 3 different kinds in a 30 second video.

- **Grow into the frame:** a shape from this moment (a chip, the button, a card on the screenshot, the logo's background) scales up until it fills the screen, and its color becomes the next background. Or the reverse: the whole frame shrinks down into a shape in the next scene.
- **Flood and contract:** a black or brand-color shape floods the frame from a point (a circle, a rounded box, the logo shape), then contracts into the next scene's frame: it becomes the device screen, the card, the chip.
- **Zoom through:** the camera pushes into part of a screen until one color or shape fills the frame and becomes the next scene's background.
- **Hand-off:** an element stays on screen while the world changes around it (the logo shrinks into an icon on the next screen, or a label stays while the device behind it swaps). It always stays inside the safe area, away from the frame corners.
- **Device turn:** the device rotates in 3D (`perspective` on the parent, `rotateY` on `m.el`) and the next screen or the next device is on the other side.

Build a morph with real sizes: the shape's start box is the old element's box, its end box is the next element's box (use `getBoundingClientRect` once at build time, or compute it from `C` numbers). Animate `width`, `height`, `x`, `y` and `border-radius` together with one sharp ease (`expo.inOut` or `power4.inOut`), 0.35 to 0.6 seconds, peaking on a beat. Hide what's underneath (`visibility: hidden`) only once the shape fully covers it.

### Keynote moves (use them all through the middle)

- **Mask line text:** every line of text rises out of a thin line, as if out of a slot: the line sits inside a box with `overflow: hidden`, a thin brand-color rule can draw first, then the text slides up from below (`Wrenn.reveal(tl, el, { by: "lines", at, vibe: v })`). It leaves the same way, quickly (`Wrenn.hide`).
- **Spring pops:** icons, chips and badges pop in on a spring (`v.pop`), from scale 0 to a little over 1 and back, staggered.
- **Cursor drives the change:** draw a simple arrow cursor (inline SVG). It moves with easing to a button or item, presses (scale 0.85 for 0.08 seconds and back), and the click is what starts the next change (a screen swaps, a chip lights up, the flood starts from that point).
- **Camera zoom:** the camera always has a target. Zoom the whole device or the whole stage so the moment that matters fills the frame, then pull back out for the next one (`m.focus` for a spot inside the screen, or animate `m.el` / a stage wrapper for the whole thing).
- **Highlight:** an accent-color ring or outline snaps around the key part while everything else dims.

**Device frames: use real ones, not drawn boxes.** Whenever a screenshot appears inside a phone, laptop or tablet, use `Wrenn.mockup(img, { model, width })` (realistic frames from Devices.css, already in `scene/vendor/`): `"iphone-14-pro"`, `"iphone-14"`, `"google-pixel-6-pro"` or `"galaxy-s8"` for phones, `"macbook-pro"` or `"macbook-pro-2018"` for laptops, `"ipad-pro"` for a tablet, `"imac"` for a desktop. Phone screenshots go in a phone, wide desktop screenshots in a laptop or iMac. A home-made rounded box with a fake notch looks cheap. `Wrenn.device(...)` is only for a plain browser window. You may still build your own panels, cards and shapes in HTML and CSS.

### Backgrounds

The video travels from dark to light, or from dark to the full brand color: night tone for the tease, the brand color for the reveal, then 1 or 2 more moods (a light tint, the full brand color, back to deep) through the features and the montage. A background only ever changes through a morph (a shape that grows into it), never on its own.

### Pace

- **Something changes on every beat (0.5 seconds at 120 BPM):** a line rises, a chip pops, the cursor clicks, the camera lands a zoom, a shape starts its morph.
- **Holds are short:** once a moment has landed, move on within about 1 second. The only long hold is the ending (1.5 seconds or more).
- **The camera never stops:** under every hold, a slow push-in or drift keeps running.
- **Rough split:**
  - 15 seconds: tease 0 to 2, reveal 2 to 4, 2 hero features 4 to 10, what's new 10 to 12, finale 12 to 15.
  - 30 seconds: tease 0 to 4, reveal 4 to 6, 3 or 4 hero features 6 to 22, what's new 22 to 25, finale 25 to 30.
  - Move these by a beat or two if your story needs it, but keep big changes on a full bar (2, 4, 6 ...) when you can.
- **The cursor never covers what it points at:** it stops just below and to the right of the target, and moves away after the click so the label is fully readable.
- **Text:** 1 to 4 words per line, one idea per moment. Take it out before the next text comes.
- Screen recordings work great inside a hero feature device (see "Screen recordings" below).
- Use the screenshots in the order that tells the best story (start, middle, result). You don't have to use every image, use the best ones.

**Timing** from `length`: the total must equal `length` exactly. Plan the times yourself from the split above.

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size. On `youtube` (landscape) put the label beside the device frame instead of above it.

### Energy: make it feel alive

Test videos felt a bit slow. Keep this pace:

- **Moves are quick:** entrances 0.3 to 0.5 seconds, exits 0.2 to 0.3 seconds, transitions 0.25 to 0.4 seconds. Nothing but a slow camera push takes longer than 0.7 seconds.
- **Sharp eases:** `expo.out`, `back.out(1.6)`, `power4.inOut`. Never `sine` or a slow `power1`.
- **Something lands on every beat** (every 0.5 seconds). If a beat has nothing, add a small hit: a shape pops, a word bumps, the camera punches in 3%.
- **Nothing is ever still:** under every hold, a push-in, drift or bob keeps running. Once something has landed and can be read, move on within 1 second.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill, and a flood shape while it covers the whole frame, may reach the corners. All text stays inside `C.safe`.
- **Big, readable on mute.** Tease, name and ending lines at least `C.u * 11`. Labels and chips at least `C.u * 6.5`. Short words, high contrast, never more than about 6 words on screen at once.
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While something holds, something else moves gently (a slow drift, a soft scale, a shape breathing). No frozen frames longer than half a second.
- **Continuity, always.** Every scene is derived from the one before it. One or two shapes or colors live through the whole video (the tease line that becomes the reveal shape, that becomes the first screen's backdrop, that becomes the button). The viewer should never see a hard reset.
- **No cuts, no generic transitions.** No crossfades, no hard cuts, no plain slide-in from the side, no spinning cube, no glitch, no zoom blur. Use the morphs from Step 3.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later (the logo, labels, shapes) must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the start of the tease may be visible.
- **One scene at a time.** Keep each scene in its own container and hide it (`visibility: hidden`) once the next scene has fully covered it, so old scenes never peek through.
- **Text stays readable.** Text never sits on top of a busy screenshot or the logo. Put it on a clean background, or on a solid panel. The logo shows in the reveal and the finale, with clear space around it.
- **Never cut through words.** Whatever you zoom, crop or frame, every word and number the viewer can see must be whole. A screen edge may cut through empty space or a picture, never through text ("come back, Lian" or "51,400" with the start missing is a fail). Plan each zoom with real numbers: from the screenshot's size, the zoom and the focus point, work out which part of the image is visible, and check that no line of text runs past its left or right edge. This goes for morph shapes too: a shape that grows or shrinks never clips a word in half while it's readable.
- **Phone screens show their full width.** A screenshot inside a phone frame always fits the phone's width exactly (no zooming in sideways). To show more, scroll it up and down. For a closer look at a phone screen, zoom the whole phone, not the picture inside it.
- **Screenshots stay clear.** Shapes, rings, cursors and highlights may sit on a screenshot, but never cover the key words or numbers. Don't zoom a full screenshot past 2.2 (it gets blurry). Keep the important part inside the frame (no key buttons or words cut off at the edge).
- **No AI-slop look.** These make a video look auto-generated, so avoid them: soft blurry glows or radial gradients behind things (the tease light line is a crisp solid line, not a glow), lens flares, everything fading and scaling up from the center the same way, the same ease and the same duration on every move, slow floaty motion, things drifting in at half opacity, gradient text, glassy blurred cards. Instead: solid brand colors, crisp edges, sharp eases, moves with different speeds and directions.
- **No stock emoji**, no clip art, no fake UI you invent, no lorem ipsum. Only the user's real screenshots, logo, words and colors.
- **On the beat:** the music is 120 BPM, so one beat is 0.5 seconds and one bar is 2 seconds. Land hits (pops, clicks, scale punches, text lines) on the 0.5 second grid, and put the name reveal and big morphs on a full bar (2, 4, 6 ...) when you can. Morphs should peak right on the beat.

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

**Screen recordings:**

```js
const rec = await Wrenn.loadVideo("../assets/demo.mp4");
const d = Wrenn.mockup(rec, { model: "macbook-pro", width: C.safe.width * 0.8 }); // or Wrenn.device(rec, { maxWidth, maxHeight }) for a browser window
Wrenn.syncVideo(rec, { start: 4.0, from: 0 }); // plays from timeline second 4.0
```

The video never plays on its own: each `seek` sets its `currentTime`. Use only the part you need (a few seconds), and if a recording won't load, leave it out and carry on.

**Safe area check:** if you can open the page in a browser, run `await Wrenn.checkSafeArea()` in the console; it lists anything in a corner or text outside the safe box. Opening `scene/index.html#debug` shows the safe box. Don't install anything to do this.

## Step 6: Sound effects (scene/sound.json)

Wrenn adds music and sound effects after the render. Music is added for you: don't pick or make any. Keep your hits on a steady 0.5 second grid where you can (0.5, 1.0, 1.5 ...), so the video feels on the beat.

Your job is to say where the sound effects go. Write `scene/sound.json` next to `scene/index.html`:

```json
{ "hits": [ { "t": 0.5, "type": "pop" }, { "t": 2.0, "type": "whoosh" } ] }
```

- `t` is the second on the timeline where the sound lands. It must match the exact time of that moment in your timeline (the same number you passed to `tl.to`, `Wrenn.reveal` or `device.focus`), not a guess.
- One hit for each moment that matters: every morph, pop, scale punch, text reveal and the logo hit. Skip the small stuff (drifts, breathing shapes, each single word of a reveal).
- Types, used with taste:
  - `whoosh`: big moves and morphs. It peaks at `t`.
  - `pop`: things appearing (a label, a chip, a screen).
  - `click`: a cursor click or a zoom stop on a screenshot.
  - `impact`: the name reveal. Usually once.
  - `riser`: builds up and ends at `t`. One or two at most, for example out of the tease into the name reveal (same `t` as the impact).
- Not too many: about one hit every 0.5 to 1.5 seconds. Never more than 60. Two hits less than 0.2 seconds apart sound messy, so keep the more important one (a riser ending on its impact is fine).

Tip: `Wrenn.hit(t, type)` notes a hit and gives `t` back, so you can write it right where the tween is: `tl.to(logo, {...}, Wrenn.hit(T_LOGO, "impact"))`. After `Wrenn.install()`, `Wrenn.sound()` (also `window.WRENN_SOUND`) returns the sorted list. The page can't write files, so you still write `scene/sound.json` yourself, with the same times.

## Rules for this folder

- Only create or edit files inside `scene/`. Mostly that's `scene/index.html` and `scene/sound.json`; you may add more `.css`, `.js` or `.svg` files in `scene/`.
- Don't change `scene/vendor/`, `scene/fonts/` or `scene/wrenn.js`. Never change `assets/` or `brief.json`.
- Never use the network: no CDNs, no web fonts from the internet, no npm installs, no downloads. Everything you need is here.
- Don't try to render the MP4. Wrenn does that.

## When you're finished

Write `done.json` in this folder (next to `brief.json`, the one file you write outside `scene/`):

- It worked: `{"ok": true}`
- You couldn't make it: `{"ok": false, "reason": "short plain reason the user can understand"}`

Before that, check `scene/sound.json`: it's valid JSON, every `t` is inside the video length and matches your timeline, and there are 60 hits or fewer.

Write `done.json` last, only after `scene/index.html` and `scene/sound.json` are complete. Then tell the user, in a line or two, that their video is ready in Wrenn.
