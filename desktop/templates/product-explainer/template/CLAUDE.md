# Wrenn video job: Product explainer

Inspired by @finnardley on motion-graphics.org (style only, Wrenn's own prompt).

You are making a short animated explainer for someone who is not technical. They opened this folder in Claude Code and typed something like "make my video". That is your whole brief from them. Don't ask them questions: everything you need is in this folder. Just make the video.

The result should feel like a crisp animated explainer made by a studio: it tells a small story, step by step, so a stranger understands what the app does and why they'd want it. Not a slideshow, not a template.

**Your mindset: you are explaining, not showing off.** Someone who has never heard of this app watches it with the sound off. By the end they should be able to say, in their own words, "it does X for me, like this, in a few steps". Every shot answers one question: what's the problem, what is this, how does it work, what do I get, what do I do now. Build it only from their real material: the logo, fonts, colors, what they wrote in `about`, and especially the real screens. The size and length always come from `brief.json` (never assume a size or a length).

There is no voiceover. **The captions tell the story**, so they matter as much as the visuals.

## How to talk to the user

- Keep replies short, friendly and free of jargon. No code, no file names, no talk about timelines or HTML.
- At the start, say one line like "On it! Making your video now."
- At the end, say one or two lines like "Your video is ready. Head back to Wrenn to watch it."
- If something stops you, say what's wrong in plain words (for example "I couldn't open your logo file. Could you add it again in Wrenn?").

## Step 1: Read everything

1. Read `brief.json`. Fields:
   - `brandName`: the brand or product name
   - `endingText`: the last line of the video, for example "Download it free"
   - `about` (optional, may be missing): one or two sentences from the user about what their app does. **This is the spine of the explainer.** Read it carefully: it tells you the problem the app solves, who it's for, and what the steps are. Use it to choose the problem scene, pick which screenshots become the steps, put them in order, and decide where to zoom on each one. Write every caption from it in your own short words (2 to 6 words each). Never paste it on screen as a sentence or a paragraph. If it's missing, work the story out from the screenshots: what does someone do first, next, and what do they end up with?
   - `size`: `reels`, `feed`, `square` or `youtube`
   - `length`: `"30"` or `"60"` (seconds). If it says `"15"`, make the short version described in Step 3.
   - `vibe`: `playful`, `clean`, `bold` or `calm`
2. Open and look at every file in `assets/`:
   - Images whose name contains `logo` are the logo. If there's no file named like that, a small, square-ish image with a transparent background is probably the logo. The logo is optional: if there is none, use the brand name.
   - Other images are screenshots. Look at each one closely: what does this screen do, what step of using the app is it, and where on it is the exact part that matters (a button, a field, a result, a number)?
   - Video files (`.mp4`, `.webm`, `.mov`) are screen recordings. They make great steps.
   - Font files (`.woff2`, `.woff`, `.ttf`, `.otf`) are the brand's fonts. Use them.
3. Read `scene/wrenn.js` once. It has the helpers you'll use.

## Step 2: Decide the look

- **Colors:** pick 2 or 3 colors from the logo: one main brand color, one accent, plus a background (a very dark or very light tone of the brand color often works best). Write them as CSS variables at the top of `scene/index.html`. If there is no logo, pick colors from the screenshots, or a tasteful palette that fits the vibe: playful (warm, saturated, 2 bright colors on a deep background), clean (one strong color on near-white), bold (high contrast, one loud color on near-black), calm (soft muted tones, low contrast background, one gentle accent). Check text contrast with `Wrenn.contrast(a, b)` (aim for 4.5 or more) or pick text color with `Wrenn.readableOn(bg)`.
- **Fonts:** if `assets/` has brand fonts, add them with `@font-face` (path `../assets/<file>`) and use them. Otherwise use Figtree, already in `scene/fonts/`: weight 800 to 900 for captions and big lines, 600 to 700 for small labels.
- **Shapes: copy the brand's own shape language from the screenshots, never default to perfect pills.** Before you draw any caption box, step marker, chip, label, highlight or badge, look at how the brand draws them: highlighted words, tags, cards, buttons and icons' backgrounds. Write down in a comment what you see (for example "hand-painted blobs with rough edges behind words, pill only for the main button", or "sharp 4px corners, thin outlines", or "soft fully round pills").
  - Use that same shape for every caption box, step marker, chip, label and highlight you add. Use the brand's button shape only for buttons (like the ending button).
  - Hand-drawn or organic shapes (rough blobs, brush or marker marks): build them so they still look hand-made, for example an uneven `border-radius` (like `45% 38% 42% 40% / 50% 46% 54% 50%`) plus a small tilt, and roughen the edge with an SVG filter (`feTurbulence` + `feDisplacementMap`, fixed `seed` so every frame is the same). Give neighbouring shapes different radii and tilts so they don't look stamped out.
  - If the brand has no clear shape style, pick one that fits the vibe and keep it the same everywhere in the video.
- **Vibe** changes the motion. Use `const v = Wrenn.vibe(brief.vibe)`, which gives eases (`v.enter`, `v.exit`, `v.move`, `v.pop`), a stagger (`v.stagger`) and `v.d(seconds)` to scale durations by speed.
  - playful: bouncy overshoot, faster, little rotations, things pop and squash.
  - clean: smooth expo eases, precise, minimal rotation, generous space.
  - bold: fast and punchy, big type, hard cuts on the beat, strong scale hits.
  - calm: slower, soft eases, gentle drift, small overshoot only.
- **Film grain (optional):** a very light grain can make flat colors feel printed. If you add it, use an SVG `feTurbulence` layer at 3 to 6% opacity over the whole frame. To make it shimmer, change its `seed` from the timeline (for example in an `onUpdate` on `tl`, set the seed to `Math.floor(time * 12)`), never from a clock or `Math.random()`. Skip it for `clean`.

## Step 3: Plan the story

This is the most important step. Before writing any code, write the plan as a comment at the top of the script: every beat of the story, its start and end time, each caption's exact words and times, the camera move under each caption, and the sound hits. Then build it.

### The story, in five parts

1. **The problem.** Open on a small, relatable pain the app fixes, in one or two captions (for example "Too many tabs open" or "Invoices pile up"). Show it with simple shapes and icons you draw yourself in the brand colors: a stack of cards that keeps growing, a clock spinning, a tangle of lines, a sad empty box. Keep it flat and graphic. **No fake UI here**, no invented screens, no clip art, no emoji. The drawing must come from the real problem in `about` (or what the screenshots make obvious), not a generic "stress" picture.
2. **Meet the product.** The problem shapes get swept away, folded up or turned into the logo. The logo lands with a springy overshoot, the `brandName` rises in beside or under it through a mask. One caption that says what it is in a few words ("Your invoices, sorted"). No logo file? Do the same with the brand name and a brand shape.
3. **How it works, in steps.** 3 or 4 numbered steps (see Pace for how many). Each step is one real screen:
   - A big **step marker** pops in with overshoot: the number ("1", "2", "3") huge, inside the brand's shape. It stays visible for the whole step, next to or above the device, and becomes the next number when the next step starts (it flips, rolls or squashes into the new number, never just swaps).
   - The screenshot sits in a **real device mockup** (`Wrenn.mockup`, see "Device frames" below).
   - The **camera moves into the exact part that matters** for that step: the field you type in, the button you press, the result that appears. Use `m.focus(...)` for a zoom on the screen, or move and scale the whole device for phones. Then pull back or slide on to the next detail.
   - The step's caption says what you do, as an action: "Add your logo", "Pick a size", "Hit generate".
   - Optional: a cursor that clicks the thing the caption names, an accent ring that snaps around it, or a drawn arrow that points at it.
4. **The result.** The payoff of using the app. Use the screenshot that shows a done state (a finished file, a full dashboard, a success screen), or a real number you can read in the screenshots, counting up in huge type. Caption the benefit, not the feature: "Done in two minutes", "All your money, one place". Only claim what the material shows: no made-up stats.
5. **Call to action.** Logo plus `endingText` made into a button in the brand's button shape. It pops in, a cursor taps it (the button dips and springs back), a last pulse on the final beat. **Hold the `endingText` fully on screen for at least 1.5 seconds**, still and readable, with only a gentle drift underneath.

### Diagrams you draw

Simple drawn graphics help explain: an arrow from step 1 to step 2, a connector line that draws itself between two parts of a screen, a small flow of boxes (file goes in, video comes out), a progress line that fills as the steps go by. They are welcome, as long as they only show real information from `about` or the screenshots. Draw them with inline SVG (`stroke-dasharray` / `stroke-dashoffset` animated on `tl` to draw a line) or plain HTML shapes, in the brand colors, with crisp edges.

### Captions

Captions carry the story, so treat them like the main character.

- **Short:** 2 to 6 words. One idea each. Never a full sentence from `about`.
- **Big:** at least `C.u * 7.5` for captions, `C.u * 11` for the problem line, the product line and the ending. High contrast.
- **In the brand's shape language:** sit each caption on the brand's own shape (a rough marker blob, a sharp tag, an outlined box), or as plain bold type on a clean background if that's the brand's style. Not a default pill unless the brand uses pills.
- **Rising into place with a mask:** each line sits in a box with `overflow: hidden` and slides up into view (`Wrenn.reveal(tl, el, { by: "lines", at, vibe: v })`). The shape behind it can pop or wipe in a beat earlier. Take it out with `Wrenn.hide(...)` or a quick upward wipe.
- **One caption at a time.** The old one is fully gone before the next one starts rising.
- **Readable on mute:** each caption stays fully on screen for about 1.5 to 2.5 seconds (longer for more words), counted from when it has finished rising to when it starts leaving.
- **Placement:** on reels, feed and square, captions go above or below the device, never on top of the screenshot. On `youtube`, put the caption and the step marker beside the device. Keep the same caption position within a step so the eye doesn't hunt.

### Nothing holds still

**Every caption line gets a camera move or a transformation underneath it.** While a caption is on screen, something is moving: the camera pushing into the screen, sliding along it from one part to the next, the device tilting slowly, shapes reshaping, a diagram drawing itself, a number counting.

- **Camera moves** use `power2.inOut` or `power3.inOut` (or `v.move` when it's one of those). They start and stop softly, like a real camera.
- **Pops** (step markers, chips, the logo, the button) use a springy overshoot (`v.pop`, or `back.out(1.7)` to `back.out(2.4)`).
- Once a camera move has landed, keep a slow drift going (a small scale or position change) until the next move. No frozen frames longer than half a second.

### Transitions between beats

Fast and motivated: 0.3 to 0.5 seconds, sharp eases like `expo.inOut` or `power4.inOut`, landing on a beat. Use at least 3 kinds in a 30 second video. Good ones for an explainer:

- **Morph:** a problem shape grows, flattens and becomes the background or the shape behind the logo.
- **Zoom through:** the camera pushes into part of the screen until a solid color in it fills the frame and becomes the next background.
- **Step slide:** the device slides out one way while the next one comes in the same direction, the step marker rolling to the next number between them, like turning a page.
- **Circle or shape wipe:** a brand-color shape grows from the last thing that moved (the click, the step marker) and gives way to the next beat.
- **Bar wipe:** a thick accent bar sweeps across and leaves the next beat behind it.

Change the background between parts (a deep brand tone for the problem, the full brand color for the product reveal, a light tint for the steps, for example). Keep 1 or 2 brand shapes traveling through the whole video so it feels like one piece.

### Pace and timing

The music is 120 BPM: one beat is 0.5 seconds, one bar is 2 seconds. Put part changes on a full bar where you can.

- **30 seconds:** problem 0 to 5 s (2 captions), product 5 to 8 s, 3 steps from 8 to 24 s (about 5 s each, 2 captions or 2 camera stops each), result 24 to 27 s, call to action 27 to 30 s.
- **60 seconds:** problem 0 to 9 s (3 or 4 captions), product 9 to 14 s, 4 steps from 14 to 46 s (about 8 s each, 2 to 3 camera stops each, each with its caption), result 46 to 54 s, call to action 54 to 60 s.
- **15 seconds (only if the brief says so):** problem 0 to 3 s (1 caption), product 3 to 5 s, 2 steps from 5 to 12 s, call to action 12 to 15 s. Fold the result into the last step.

These are starting points: shift them to fit the material, but the total must equal `length` exactly. Count your captions against the time: if they don't each get 1.5 seconds of hold, cut words or cut captions, never rush them.

Use the screenshots in the order someone would really use the app. You don't have to use every image: pick the ones that explain best. If there are fewer screenshots than steps, use 2 or 3 stops on one screen as separate steps, or a recording.

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size.

**Device frames: use real ones, not drawn boxes.** Whenever a screenshot appears inside a phone, laptop or tablet, use `Wrenn.mockup(img, { model, width })` (realistic frames from Devices.css, already in `scene/vendor/`): `"iphone-14-pro"`, `"iphone-14"`, `"google-pixel-6-pro"` or `"galaxy-s8"` for phones, `"macbook-pro"` or `"macbook-pro-2018"` for laptops, `"ipad-pro"` for a tablet, `"imac"` for a desktop. Phone screenshots go in a phone, wide desktop screenshots in a laptop or iMac. A home-made rounded box with a fake notch looks cheap. `Wrenn.device(...)` is only for a plain browser window. You may still build your own panels, cards, shapes and diagrams in HTML and CSS.

### Energy: make it feel alive

Test videos felt a bit slow. Keep this pace:

- **Moves are quick:** entrances 0.3 to 0.5 seconds, exits 0.2 to 0.3 seconds, transitions 0.25 to 0.4 seconds. Nothing but a slow camera push takes longer than 0.7 seconds.
- **Sharp eases:** `expo.out`, `back.out(1.6)`, `power4.inOut`. Never `sine` or a slow `power1`.
- **Something lands on every beat** (every 0.5 seconds). If a beat has nothing, add a small hit: a shape pops, a word bumps, the camera punches in 3%.
- **Nothing is ever still:** under every hold, a push-in, drift or bob keeps running. Once something has landed and can be read, move on within 1 second.
- **Captions are the exception:** each caption still stays up long enough to read (see Captions above), but the camera and the screen under it keep moving the whole time.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill may reach the corners. All text stays inside `C.safe`.
- **Big, readable on mute.** See the caption sizes above. Short words, high contrast, never more than about 6 words on screen at once (the step number doesn't count).
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While something holds, something else moves gently (a slow drift, a soft scale, a shape breathing). No frozen frames longer than half a second.
- **Continuity between parts.** One or two shapes or colors live through the whole video and move from part to part (a problem shape that becomes the backdrop of the logo, a color that wipes into the next background). The viewer should never see a hard reset.
- **No generic transitions.** No crossfades, no plain slide-in from the side, no spinning cube, no glitch, no zoom blur. Use the transitions from Step 3. Each cut is motivated: something exits and the next thing enters from where the eye already is.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later (the logo, captions, step markers, shapes) must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the start of the problem scene may be visible.
- **One scene at a time.** Keep each part in its own container and hide it (`visibility: hidden`) once the next one has fully covered it, so old scenes never peek through.
- **Text stays readable.** Captions never sit on top of a busy screenshot or the logo. Put them on a clean background, or on a solid brand shape. The logo shows in the product reveal and the call to action, with clear space around it.
- **Never cut through words.** Whatever you zoom, crop or frame, every word and number the viewer can see must be whole. A screen edge may cut through empty space or a picture, never through text ("come back, Lian" or "51,400" with the start missing is a fail). Plan each zoom with real numbers: from the screenshot's size, the zoom and the focus point, work out which part of the image is visible, and check that no line of text runs past its left or right edge.
- **Phone screens show their full width.** A screenshot inside a phone frame always fits the phone's width exactly (no zooming in sideways). To show more, scroll it up and down. For a closer look at a phone screen, zoom the whole phone, not the picture inside it.
- **Screenshots stay clear.** Shapes, rings, cursors, arrows and highlights may sit on a screenshot, but never cover the key words or numbers. Don't zoom a full screenshot past 2.2 (it gets blurry). Keep the important part inside the frame (no key buttons or words cut off at the edge).
- **The cursor never covers what it points at:** it stops just below and to the right of the target, and moves away after the click so the label is fully readable.
- **No AI-slop look.** These make a video look auto-generated, so avoid them: soft blurry glows or radial gradients behind things, everything fading and scaling up from the center the same way, the same ease and the same duration on every move, slow floaty motion, things drifting in at half opacity, gradient text, glassy blurred cards. Instead: solid brand colors, crisp edges, sharp eases, moves with different speeds and directions, and hard, confident cuts.
- **No stock emoji**, no clip art, no fake UI you invent, no lorem ipsum, no made-up numbers. Only the user's real screenshots, logo, words and colors, plus simple shapes and diagrams you draw from real information.
- **On the beat:** land hits (pops, clicks, step markers, caption reveals) on the 0.5 second grid, and put part changes on a full bar (2, 4, 6 ...) when you can. Transitions should peak right on the beat.

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

The video never plays on its own: each `seek` sets its `currentTime`. Use only the part you need (a few seconds), and if a recording won't load, leave it out and carry on. A recording makes a strong step: let it play while the caption explains what's happening, with a slow push-in on the part that changes.

**Safe area check:** if you can open the page in a browser, run `await Wrenn.checkSafeArea()` in the console; it lists anything in a corner or text outside the safe box. Opening `scene/index.html#debug` shows the safe box. Don't install anything to do this.

## Step 6: Sound effects (scene/sound.json)

Wrenn adds music and sound effects after the render. Music is added for you: don't pick or make any. Keep your hits on a steady 0.5 second grid where you can (0.5, 1.0, 1.5 ...), so the video feels on the beat.

Your job is to say where the sound effects go. Write `scene/sound.json` next to `scene/index.html`:

```json
{ "hits": [ { "t": 0.5, "type": "pop" }, { "t": 2.0, "type": "whoosh" } ] }
```

- `t` is the second on the timeline where the sound lands. It must match the exact time of that moment in your timeline (the same number you passed to `tl.to`, `Wrenn.reveal` or `device.focus`), not a guess.
- One hit for each moment that matters: every cut, pop, step marker, caption reveal, zoom stop and the logo hit. Skip the small stuff (drifts, breathing shapes, each single word of a reveal).
- Types, used with taste:
  - `whoosh`: big moves and scene changes. It peaks at `t`.
  - `pop`: things appearing (a caption, a step marker, a shape, a screen).
  - `click`: a zoom or focus stop on a screenshot, a cursor click.
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
