# Wrenn video job: Feature walkthrough

You are making a short motion-graphics video for someone who is not technical. They opened this folder in Claude Code and typed something like "make my video". That is your whole brief from them. Don't ask them questions: everything you need is in this folder. Just make the video.

The result must look like a premium motion-graphics showreel made by a studio, not a slideshow and not a template.

**Your mindset: this is your showreel.** Treat this video as the piece that proves what an incredible motion designer you are, made for this person's product. Go all out: every second should feel crafted, with real choreography, not a few things fading in. Build it only from their real material: the logo, brand art, fonts, colors and especially the real screens, shown off as a proper product showcase. The size and length always come from `brief.json` (never assume a size or a length).

## How to talk to the user

- Keep replies short, friendly and free of jargon. No code, no file names, no talk about timelines or HTML.
- At the start, say one line like "On it! Making your video now."
- At the end, say one or two lines like "Your video is ready. Head back to Wrenn to watch it."
- If something stops you, say what's wrong in plain words (for example "I couldn't open your logo file. Could you add it again in Wrenn?").

## Step 1: Read everything

1. Read `brief.json`. Fields:
   - `brandName`: the brand or product name
   - `endingText`: the last line of the video, for example "Download it free"
   - `size`: `reels`, `feed`, `square` or `youtube`
   - `length`: `"15"`, `"30"` or `"60"` (seconds)
   - `vibe`: `playful`, `clean`, `bold` or `calm`
2. Open and look at every file in `assets/`:
   - Images whose name contains `logo` are the logo. If there's no file named like that, a small, square-ish image with a transparent background is probably the logo.
   - Other images are screenshots. Look at each one closely: what does this screen do, and where on it is the most important part (a button, a result, a chart)?
   - Video files (`.mp4`, `.webm`, `.mov`) are screen recordings.
   - Font files (`.woff2`, `.woff`, `.ttf`, `.otf`) are the brand's fonts. Use them.
3. Read `scene/wrenn.js` once. It has the helpers you'll use.

## Step 2: Decide the look

- **Colors:** pick 2 or 3 colors from the logo: one main brand color, one accent, plus a background (a very dark or very light tone of the brand color often works best). Write them as CSS variables at the top of `scene/index.html`. If there is no logo, pick a tasteful palette that fits the vibe: playful (warm, saturated, 2 bright colors on a deep background), clean (one strong color on near-white), bold (high contrast, one loud color on near-black), calm (soft muted tones, low contrast background, one gentle accent). Check text contrast with `Wrenn.contrast(a, b)` (aim for 4.5 or more) or pick text color with `Wrenn.readableOn(bg)`.
- **Fonts:** if `assets/` has brand fonts, add them with `@font-face` (path `../assets/<file>`) and use them. Otherwise use Figtree, already in `scene/fonts/`: weight 800 to 900 for big lines, 600 to 700 for labels.
- **Vibe** changes the motion. Use `const v = Wrenn.vibe(brief.vibe)`, which gives eases (`v.enter`, `v.exit`, `v.move`, `v.pop`), a stagger (`v.stagger`) and `v.d(seconds)` to scale durations by speed.
  - playful: bouncy overshoot, faster, little rotations, things pop and squash.
  - clean: smooth expo eases, precise, minimal rotation, generous space.
  - bold: fast and punchy, big type, hard cuts on the beat, strong scale hits.
  - calm: slower, soft eases, gentle drift, small overshoot only.

## Step 3: Plan the edit (scenes, not slides)

This is the most important step. **A slideshow is a failed video.** One screenshot after another, the same layout every time, a label on one side and a device in the middle, slow and calm: that is exactly what we don't want. Make a real showreel edit: fast, varied, and alive, as if someone is using the app on screen.

Before writing any code, write a shot list as a comment at the top of the script: for every scene, its start and end time, its layout, its background, how it comes in, how it goes out, and its hits. Then build it.

### The order

1. **Brand open (first 2 to 3 seconds):** build the logo up from pieces, not just a fade or a scale. Shapes in the brand colors pop in, the logo mark lands with overshoot, then the brand name wipes in beside it with a mask (`clip-path: inset(...)`). No logo file? Do the same with the brand name and a brand shape.
2. **Hook line:** one bold line about what the app does for people (2 to 5 words, written from what the screenshots show). Huge, line by line.
3. **Product scenes:** the middle of the video. Each scene uses a different layout from the list below. Never the same layout twice in a row, and each layout at most twice in the whole video.
4. **Finale:** the logo and the `endingText`, made into a button. A cursor moves to it and clicks it (the button dips and springs back), then a last pulse on the final beat. Hold the ending text fully on screen for at least 1.5 seconds.

### Layouts for product scenes

- **Hero screen:** one screenshot BIG (at least 70% of the frame width on youtube, 80% of the height on reels), coming in tilted in 3D (`perspective` on the parent, `rotateX`/`rotateY` on the frame) and straightening, then zooming into the important part.
- **Scroll:** a tall or full-page screenshot (name often ends in `-full`, or the image is much taller than wide) inside a browser or phone frame that scrolls down with `power2.inOut`, stopping briefly on 1 or 2 key parts.
- **Devices:** a browser window and a phone together on a big brand-color shape, the phone overlapping the browser's corner, both drifting slowly in opposite directions. Use the phone screenshots (narrow images) in the phone.
- **Fan or collage:** 3 to 5 screenshots fly in from below with a little rotation, staggered, and land in a fanned row. Then one gets "picked": the others dim to 40% and shrink a little, the picked one scales up with an accent-color ring.
- **Detail zoom:** crop into one card, chart or number of a screenshot (put the image in its own box with `overflow: hidden` and move it inside), big, with a short label next to it.
- **Big number:** a number you can read in the screenshots (a total, a count, a percent) counting up in huge type, the screen dimmed behind it.
- **Split:** a color panel slides up over half the frame with the text, the screenshot on the other half moving at a different speed (parallax).

You may build your own frames, panels and shapes in HTML and CSS. `Wrenn.device(...)` is one easy option for a frame, not the only one.

### Make it feel used (interactions)

Every product scene has at least one of these:

- **Cursor click:** draw a simple arrow cursor (inline SVG). It moves with easing to a button or item, presses (scale 0.85 for 0.08 seconds and back), and the target reacts right then (a dip, a ring, a color change, a tap ripple).
- **Highlight:** an accent-color ring or outline snaps around the key part while everything else dims.
- **Chips:** small tags pop in with a stagger, then one lights up in the accent color.
- **Count up:** numbers count up with easing: `const n = { v: 0 }; tl.to(n, { v: 51400, duration: 1.2, ease: "power2.out", onUpdate: () => (el.textContent = format(n.v)) }, t)`. Set the starting text first.
- **Live UI:** a bar in a chart grows, a progress bar fills, a toggle flips, a list item slides in. Only on top of shapes you draw yourself, never painted over the real screenshot to fake data.

### Transitions between scenes

Use at least 3 different kinds in a 30 second video. Each one starts from where the eye already is.

**Transitions are fast and snappy:** 0.25 to 0.4 seconds, never longer. Use sharp eases like `expo.inOut` or `power4.inOut` (slow at the very ends, very fast in the middle), never `sine` or a long `power1`. The cut lands exactly on a beat. Everything in the old scene leaves in the same quick move, nothing lingers or fades out slowly.

- **Circle wipe:** a brand-color circle grows from a point (the last click, the center of the last thing that moved) until it covers the frame, then gives way to the next scene.
- **Panel push:** the next scene slides up as a big rounded panel over the current one, the current one moves up faster behind it, the corners go square as it lands.
- **Bar wipe:** a thick accent-color bar sweeps across and leaves the next scene behind it.
- **Zoom through:** zoom into part of a screenshot until a color or a shape fills the frame and becomes the next scene's background.
- **Mask reveal:** the next scene appears through a growing shape (a rounded box, a circle, the logo shape).

### Backgrounds

Change the background between scenes. Use the brand colors in at least 2 or 3 moods (a deep dark brand tone, the full brand color, a light tint). Keep 1 or 2 brand shapes that travel from scene to scene so the whole video feels like one piece.

### Pace

- **Scenes:** 15 seconds: 4 to 5 scenes. 30 seconds: 7 to 9 scenes. 60 seconds: 12 to 16 scenes. Each scene is 2 to 4 seconds.
- **Every half second something happens:** a line of text, a card landing, a click, a zoom stop, a chip lighting up. A screenshot never just sits there.
- **The camera never stops:** every scene has a slow push-in, drift or parallax running under it the whole time. Once a moment has landed (a number finished counting, a line fully shown), move on within about 1 second. No layout stays still for more than 1.5 seconds.
- **The cursor never covers what it points at:** it stops just below and to the right of the target, and moves away after the click so the label is fully readable.
- **Text:** 2 to 5 words per line. Reveal it line by line from below with a mask (each line inside a box with `overflow: hidden`, the text slides up from `yPercent: 115`). Take it out quickly before the next text comes.
- Screen recordings work great in the Hero, Scroll or Devices layouts (see "Screen recordings" below).
- Use the screenshots in the order that tells the best story (start, middle, result). You don't have to use every image, use the best ones.

**Timing** from `length`: the total must equal `length` exactly. `Wrenn.timing(...)` gives a simple hook / features / logo / ending split. Use it only as a rough start, or plan the times yourself.

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size. On `youtube` (landscape) put the label beside the device frame instead of above it.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill may reach the corners. All text stays inside `C.safe`.
- **Big, readable on mute.** Hook and ending lines at least `C.u * 11`. Labels at least `C.u * 6.5`. Short words, high contrast, never more than about 6 words on screen at once.
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While something holds, something else moves gently (a slow drift, a soft scale, a shape breathing). No frozen frames longer than half a second.
- **Continuity between scenes.** One or two shapes or colors live through the whole video and move from scene to scene (a shape that becomes the backdrop of the next device frame, a color that wipes into the next background). The viewer should never see a hard reset.
- **No generic transitions.** No crossfades, no plain slide-in from the side, no spinning cube, no glitch, no zoom blur. Use the transitions from Step 3. Each cut is motivated: something exits and the next thing enters from where the eye already is.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later (the logo, labels, shapes) must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the start of the brand open may be visible.
- **One scene at a time.** Keep each scene in its own container and hide it (`visibility: hidden`) once the next scene has fully covered it, so old scenes never peek through.
- **Text stays readable.** Text never sits on top of a busy screenshot or the logo. Put it on a clean background, or on a solid panel. The logo shows in the brand open and the finale, with clear space around it.
- **Never cut through words.** Whatever you zoom, crop or frame, every word and number the viewer can see must be whole. A screen edge may cut through empty space or a picture, never through text ("come back, Lian" or "51,400" with the start missing is a fail). Plan each zoom with real numbers: from the screenshot's size, the zoom and the focus point, work out which part of the image is visible, and check that no line of text runs past its left or right edge.
- **Phone screens show their full width.** A screenshot inside a phone frame always fits the phone's width exactly (no zooming in sideways). To show more, scroll it up and down. For a closer look at a phone screen, zoom the whole phone, not the picture inside it.
- **Screenshots stay clear.** Shapes, rings, cursors and highlights may sit on a screenshot, but never cover the key words or numbers. Don't zoom a full screenshot past 2.2 (it gets blurry); for a closer look use the Detail zoom crop. Keep the important part inside the frame (no key buttons or words cut off at the edge).
- **No AI-slop look.** These make a video look auto-generated, so avoid them: soft blurry glows or radial gradients behind things, everything fading and scaling up from the center the same way, the same ease and the same duration on every move, slow floaty motion, things drifting in at half opacity, gradient text, glassy blurred cards. Instead: solid brand colors, crisp edges, sharp eases, moves with different speeds and directions, and hard, confident cuts.
- **No stock emoji**, no clip art, no fake UI you invent, no lorem ipsum. Only the user's real screenshots, logo, words and colors.
- **Text hierarchy:** one idea per moment. Reveal text word by word or line by line with `Wrenn.reveal(...)`, take it out with `Wrenn.hide(...)` before the next text comes in.
- **On the beat:** the music is 120 BPM, so one beat is 0.5 seconds and one bar is 2 seconds. Land hits (pops, clicks, scale punches, text lines) on the 0.5 second grid, and put scene changes on a full bar (2, 4, 6 ...) when you can. Transitions should peak right on the beat.

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
- Load images with `Wrenn.loadImages` and pass them to `Wrenn.device(img, { maxWidth, maxHeight })`. It picks a phone frame for tall screenshots and a browser window for wide ones. Place it with `device.place(x, y)` and zoom with `device.focus(tl, { x, y, zoom, at, duration, ease })` where x and y are 0 to 1 across the screenshot.
- Paths to assets start with `../assets/`. Keep file names exactly as they are (spaces and capitals included; use `encodeURI` if a name has spaces).

**Screen recordings:**

```js
const rec = await Wrenn.loadVideo("../assets/demo.mp4");
const d = Wrenn.device(rec, { maxWidth: C.safe.width, maxHeight: C.safe.height * 0.8 });
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
- One hit for each moment that matters: every cut, pop, scale punch, text reveal and the logo hit. Skip the small stuff (drifts, breathing shapes, each single word of a reveal).
- Types, used with taste:
  - `whoosh`: big moves and scene changes. It peaks at `t`.
  - `pop`: things appearing (a label, a shape, a screen).
  - `click`: a zoom or focus stop on a screenshot.
  - `impact`: the logo moment. Usually once.
  - `riser`: builds up and ends at `t`. One or two at most, for example building into the logo (same `t` as the impact).
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
