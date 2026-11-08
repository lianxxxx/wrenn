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

## Step 3: Structure

The video has 4 parts, in this order:

1. **Hook:** the brand name or one bold line (you may write a short line from what the screenshots show, 2 to 5 words). Huge, centered, readable on mute.
2. **Features:** each screenshot in a device frame, one at a time. For each one:
   - a label of 2 to 5 words that says what the screen does for the user ("Pick a template", "Your video, done"). Write it yourself from what you see. No full sentences, no ending period.
   - a zoom or pan to the important part of the screenshot with `device.focus(...)`. On longer videos, give each screenshot 2 or 3 focus stops. Keep zoom at 2.2 or less so the screenshot stays sharp.
   - Use screenshots in the order that tells the best story (start, middle, result). If there are too many for the length, use the best ones so each gets at least 1.8 seconds.
   - Screen recordings play inside a device frame too (see "Screen recordings" below).
3. **Logo moment:** the logo, big, with the brand colors around it. A short, satisfying hit (scale pop, a shape wiping behind it).
4. **Ending:** the `endingText`, big and clear. Hold it long enough to read (at least 1.5 seconds fully on screen).

**Timing** from `length`: `Wrenn.timing(length, numberOfFeatures)` gives a fair split (start, end and dur of every part). You can adjust it, but the total must equal `length` exactly.

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size. On `youtube` (landscape) put the label beside the device frame instead of above it.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill may reach the corners. All text stays inside `C.safe`.
- **Big, readable on mute.** Hook and ending lines at least `C.u * 11`. Labels at least `C.u * 6.5`. Short words, high contrast, never more than about 6 words on screen at once.
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While something holds, something else moves gently (a slow drift, a soft scale, a shape breathing). No frozen frames longer than half a second.
- **Continuity between scenes.** One or two shapes or colors live through the whole video and move from scene to scene (a shape that becomes the backdrop of the next device frame, a color that wipes into the next background). The viewer should never see a hard reset.
- **No generic transitions.** No crossfades, no plain slide-in from the side, no spinning cube, no glitch, no zoom blur. Each cut is motivated: something exits and the next thing enters from where the eye already is.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later (the logo, labels, shapes) must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the hook may be visible.
- **Nothing overlaps text or the logo.** Text, the logo and screenshots never sit on top of each other, not even for a moment during a transition. The logo appears only in the Logo moment, alone and centered, with clear space around it. Take one thing out before the next comes into the same spot.
- **Screenshots stay clear.** Shapes and colors live BEHIND the device frame, never on top of it. While a screenshot is on screen nothing may cover it, and the zoom must keep the important part fully inside the frame (no key buttons or words cut off at the edge).
- **No stock emoji**, no clip art, no fake UI you invent, no lorem ipsum. Only the user's real screenshots, logo, words and colors.
- **Text hierarchy:** one idea per moment. Reveal text word by word or line by line with `Wrenn.reveal(...)`, take it out with `Wrenn.hide(...)` before the next text comes in.
- **Beat feel:** land hits (pops, scale punches, cuts) on a steady grid, for example every 0.5 seconds, so music can sync later.

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
