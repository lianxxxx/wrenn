# Wrenn video job: Kinetic typography

Inspired by @finnardley on motion-graphics.org (style only, Wrenn's own prompt).

You are making a short motion-graphics video for someone who is not technical. They opened this folder in Claude Code and typed something like "make my video". That is your whole brief from them. Don't ask them questions: everything you need is in this folder. Just make the video.

The result must look like a premium type-driven piece made by a studio, not a lyric video and not words fading in on a background.

**Your mindset: the words are the whole show.** No screenshots, no devices, no pictures. Just the user's own lines, huge, slamming in on the beat on solid brand colors. Every half second the type does something new. The size and length always come from `brief.json` (never assume a size or a length).

## How to talk to the user

- Keep replies short, friendly and free of jargon. No code, no file names, no talk about timelines or HTML.
- At the start, say one line like "On it! Making your video now."
- At the end, say one or two lines like "Your video is ready. Head back to Wrenn to watch it."
- If something stops you, say what's wrong in plain words (for example "I need a few lines of your words to make this one. Could you add them in Wrenn?").

## Step 1: Read everything

1. Read `brief.json`. Fields:
   - `brandName`: the brand or product name. It comes back at the end.
   - `about`: **the script of this video.** The user's own words, up to about 300 characters. Unlike other templates, you keep their wording here: these are their lines. Don't rewrite, reword or fix anything. You may only split it into short phrases (see Step 3). If `about` is missing or empty, stop and write `done.json` with `{"ok": false, "reason": "This template needs your words. Add a few lines in Wrenn and try again."}`.
   - `endingText`: the last line of the video, for example "Out now"
   - `size`: `reels`, `feed`, `square` or `youtube`
   - `length`: `"15"` or `"30"` (seconds)
   - `vibe`: `playful`, `clean`, `bold` or `calm`
2. Look at every file in `assets/`. This template needs no files, but if there are some:
   - Images whose name contains `logo` are the logo. If there's no file named like that, a small, square-ish image with a transparent background is probably the logo. Use it in the ending, and take your colors from it.
   - Font files (`.woff2`, `.woff`, `.ttf`, `.otf`) are the brand's fonts. Use them: in this video the font is everything.
   - Ignore screenshots and screen recordings.
3. Read `scene/wrenn.js` once. It has the helpers you'll use.

## Step 2: Decide the look

- **Colors:** pick 3 or 4 solid colors to use as full-frame backgrounds, each with a text color that reads well on it. Take them from the logo if there is one: the main brand color, an accent, a very dark tone and a very light tint of the brand color (`Wrenn.shade(hex, amount)` and `Wrenn.mix(a, b, t)` help). Write them as CSS variables at the top of `scene/index.html`. No logo? Pick a palette that fits the vibe: playful (warm, saturated, 2 bright colors plus a deep tone), clean (one strong color, near-white, near-black), bold (one loud color, near-black, white), calm (soft muted tones, one gentle accent). For every background, pick the text color with `Wrenn.readableOn(bg)` or check it with `Wrenn.contrast(a, b)` (aim for 4.5 or more).
- **Fonts:** if `assets/` has brand fonts, add them with `@font-face` (path `../assets/<file>`) and use them. Otherwise use Figtree, already in `scene/fonts/`: weight 900 for the slams, 700 to 800 for the rest. Tight letter spacing (around `-0.03em`) and tight line height (0.9 to 0.95) on the big words.
- **Shapes:** you mostly don't need any. If you add one (a bar behind a word, a block that wipes), copy the logo's shape language: its corners, stroke weight and curves. No logo? Pick one simple shape that fits the vibe and keep it the same everywhere.
- **Vibe** changes the motion. Use `const v = Wrenn.vibe(brief.vibe)`, which gives eases (`v.enter`, `v.exit`, `v.move`, `v.pop`), a stagger (`v.stagger`) and `v.d(seconds)` to scale durations by speed.
  - playful: bouncy overshoot, words squash as they land, little rotations, letters hop.
  - clean: smooth expo eases, precise, straight lines, mask reveals more than slams.
  - bold: fast and punchy, scale slams, hard color cuts on every beat, big rotations.
  - calm: slower, soft eases, one phrase per bar, small overshoot only.

## Step 3: Plan the edit

Before writing any code, write the plan as a comment at the top of the script: every phrase, its start and end time, its background color, its technique, how it comes in and how it goes out, and every hit. Then build it.

### Split the words

Split `about` into short phrases of 2 to 4 words, where a person would naturally pause or stress (at commas, at "and", before the important word). A single strong word can be a phrase on its own. Keep the user's words and their order exactly. You may drop punctuation at the end of a phrase.

Then fit them to the length. The music is 120 BPM: one beat is 0.5 seconds, one bar is 2 seconds.

- **15 seconds:** about 6 to 9 phrases, then the ending.
- **30 seconds:** about 12 to 18 phrases, then the ending.
- Each phrase gets 1 to 4 beats on screen. Give the important words more beats and a bigger move.
- Too many words for the length? Go faster (1 beat per phrase, words snapping in one at a time). If it still doesn't fit, keep the strongest lines, in their order, and leave the rest out. Never squeeze in small text.
- Too few words? Give each phrase more beats and more moves (it comes in, swaps, flips color, collapses), and bring `brandName` in once in the middle as its own slam. Never invent new lines.

### Techniques

Every phrase gets a technique, and the next one is different. Never the same technique twice in a row. Use at least 6 different ones in 15 seconds, all of them in 30 seconds.

- **Scale slam:** the word comes in at scale 3 or more and slams down to 1 on the beat with a hard ease, a tiny overshoot, and the frame shakes once (a few `C.u` for 0.1 seconds).
- **Per-letter stagger:** each letter rises out of its own mask, one after another, then the whole word settles.
- **Mask reveal:** the word is uncovered by a growing `clip-path: inset(...)`, from one side or from the middle out.
- **Rotation:** the phrase enters rotated (90 degrees, or tilted 8 to 15 degrees) and snaps straight, or the whole stack sits tilted on purpose for a beat.
- **Outline vs filled:** the word shows as an outline (`-webkit-text-stroke` with transparent fill), then fills solid on the beat. Or one word in the phrase is filled and the rest are outlines.
- **Word swap in place:** one word stays, the word next to it flips out and a new one flips in at the same spot (rising out of a mask), so the line changes without moving.
- **Cluster and collapse:** the words of a phrase land scattered around the center at different sizes and angles, then all collapse to one point in the center and are gone, on the beat.
- **Scramble:** the letters show random characters and settle one by one into the real word, left to right.
- **Line build:** letters fly in from different directions and assemble into one clean line.
- **Zoom through a letter:** the camera zooms into one letter (a heavy one, like O, B or a thick stroke) until its color fills the whole frame and becomes the next background.
- **Hard flash:** on a big beat, the whole frame flips to the accent color (or white) for 2 frames (about 0.07 seconds) and back with the next phrase. At most 2 or 3 in the whole video, never in a row.

### Backgrounds

Every phrase gets a new solid background from your palette, switched on the beat. The switch is part of the move: a color block wipes across with the new word, the zoom through a letter becomes the new color, a flash lands on the new color. Never the same background twice in a row. No pictures, no textures, no gradients.

### Ending

- Last 2 to 3 seconds: `brandName` slams in big (with the logo above or beside it if there is one), then `endingText` reveals under it.
- Hold `brandName` and `endingText` fully on screen for at least 1.5 seconds, with a very slow push-in so it never freezes, and one last pulse on the final beat.

### Pace

- **Every half second something happens:** a word lands, a letter swaps, the color flips, a phrase collapses. Nothing just sits.
- **Never more than about 6 words on screen.** Usually 1 to 4.
- A phrase leaves fast (0.15 to 0.3 seconds, sharp ease) right before the next one lands, or the next one pushes it out. Nothing fades out slowly.
- Put the hardest hits (slams, flashes, zooms) on a full bar (2, 4, 6 ...) and the smaller moves on the beats between.

**Timing** from `length`: the total must equal `length` exactly. Plan the times yourself on the 0.5 second grid.

**Canvas** from `size`: `Wrenn.canvas(brief.size)` sets the page size. reels 1080x1920, feed 1080x1350, square 1080x1080, youtube 1920x1080. Lay everything out from `C.safe`, `C.cx`, `C.cy` and `C.u` (1% of the shorter side), never hard-coded pixels, so the layout fits the size. On `reels` stack the words, one or two per line. On `youtube` a phrase can sit on one line.

### Energy: make it feel alive

Test videos felt a bit slow. Keep this pace:

- **Moves are quick:** entrances 0.3 to 0.5 seconds, exits 0.2 to 0.3 seconds, transitions 0.25 to 0.4 seconds. Nothing but a slow camera push takes longer than 0.7 seconds.
- **Sharp eases:** `expo.out`, `back.out(1.6)`, `power4.inOut`. Never `sine` or a slow `power1`.
- **Something lands on every beat** (every 0.5 seconds). If a beat has nothing, add a small hit: a shape pops, a word bumps, the camera punches in 3%.
- **Nothing is ever still:** under every hold, a push-in, drift or bob keeps running. Once something has landed and can be read, move on within 1 second.

## Step 4: Motion rules (anti-slop)

- **Corners stay empty.** Nothing may sit within 6% of any corner (a box 6% of the width by 6% of the height at each corner). Only the background fill may reach the corners. All text stays inside `C.safe`, also when it's rotated: check the corners of the rotated box, not just the word's width.
- **Huge, readable on mute.** Main words at least `C.u * 14`, the slams bigger. The ending line at least `C.u * 11`. Measure every word after the fonts load: if a long word is wider than `C.safe.width`, make only that word smaller until it fits, or break the phrase onto more lines. Never let a word run off the frame.
- **Never cut through words.** Every word the viewer can read must be whole. A mask may hide a word while it enters or leaves, but once it's landed, it's all there.
- **Easing and overshoot on everything.** No linear motion. Entrances overshoot a little (the vibe eases do this). Exits are quicker than entrances.
- **Secondary motion.** While a phrase holds, something moves gently (a slow push-in, a small drift, one letter breathing). No frozen frames longer than half a second.
- **Continuity.** Each phrase comes out of the one before: a letter of the old phrase becomes the new background, a word stays while the others swap, the collapse point is where the next word slams from. Never a hard reset to an empty frame.
- **No generic transitions.** No crossfades, no plain slide-in from the side, no spinning cube, no glitch, no zoom blur, no typewriter with a blinking cursor.
- **Hidden until its moment.** `tl.fromTo()` shows its start values right away, from the very first frame. So anything that appears later must start invisible: include `autoAlpha: 0` in the "from" values (or `gsap.set` it hidden and use `tl.to`). Check frame 0: only the first phrase may be visible.
- **One phrase at a time.** Keep each phrase in its own container and hide it (`visibility: hidden`) once it's gone, so old words never peek through.
- **No AI-slop look.** These make a video look auto-generated, so avoid them: soft blurry glows or radial gradients behind text, every word fading and scaling up from the center the same way, the same ease and the same duration on every move, slow floaty motion, things drifting in at half opacity, gradient text, text shadows, glassy blurred boxes. Instead: solid brand colors, crisp edges, sharp eases, moves with different speeds and directions, and hard, confident cuts.
- **No stock emoji**, no clip art, no lorem ipsum. Only the user's real words, logo and colors.
- **On the beat:** the music is 120 BPM, so one beat is 0.5 seconds and one bar is 2 seconds. Every word, slam, swap and color change lands on the 0.5 second grid.

**Tips for the tricky ones:**

- Split words into letters yourself (a `<span>` per letter, inside a box with `overflow: hidden` if it rises from a mask). `Wrenn.split(el)` splits into words, and `Wrenn.reveal` / `Wrenn.hide` do word by word or line by line reveals.
- **Scramble** must give the same frame every time. Pick the random letters ahead of time (`const rand = Wrenn.random(7)`, fill a fixed list of characters per letter), then tween a number on `tl` and in `onUpdate` show the list item that matches the number. Never call `rand()` inside `onUpdate`.
- **Zoom through a letter:** set `transform-origin` on the letter's thick part, scale the letter (40 or more) until its color covers the frame, then on that same frame switch the background to that color and hide the letter. Keep the zoom short (0.3 to 0.5 seconds, `expo.in`).

## Step 5: Technical contract (must follow exactly)

Wrenn renders the page frame by frame. It depends on this:

- The page sets `window.WRENN = { width, height, fps: 30, duration }` (duration in seconds).
- `window.seek(t)` sets the paused GSAP master timeline to time `t`. It may return a Promise; the renderer awaits it.
- `window.wrennReady` is a Promise that resolves once fonts and all images are loaded.

`Wrenn.install({ timeline: tl, duration })` does all three for you. Call it once, at the very end of your script. Keep the starter's shape:

```js
(async () => {
  const VIDEO = { size: "reels", duration: 15, vibe: "bold" }; // from brief.json
  const C = Wrenn.canvas(VIDEO.size);
  const v = Wrenn.vibe(VIDEO.vibe);
  const tl = gsap.timeline({ paused: true });
  await Wrenn.fontsReady();
  // only if there's a logo: const [logo] = await Wrenn.loadImages(["../assets/logo.png"]);
  // ...build the scene and add every tween to tl...
  Wrenn.install({ timeline: tl, duration: VIDEO.duration });
})().catch(Wrenn.fail);
```

Rules that keep every render identical:

- Every motion goes on the one paused timeline `tl` (`tl.to`, `tl.from`, `tl.fromTo`, `tl.set`). `gsap.set` is fine for starting positions. Never `gsap.to` or `gsap.from` on their own.
- No `Date.now`, `performance.now`, `setTimeout`/`setInterval` for motion, `requestAnimationFrame` loops, CSS animations, CSS transitions, or video autoplay. (wrenn.js switches CSS animations and transitions off anyway.)
- No `Math.random()`. Use `Wrenn.random(seed)` if you need variety.
- Copy the values from `brief.json` into the `VIDEO` object, and copy the `about`, `brandName` and `endingText` words into the page exactly. Don't fetch `brief.json` from the page (browsers block that for local files).
- Load images with `Wrenn.loadImages`.
- Paths to assets start with `../assets/`. Keep file names exactly as they are (spaces and capitals included; use `encodeURI` if a name has spaces).

**Safe area check:** if you can open the page in a browser, run `await Wrenn.checkSafeArea()` in the console; it lists anything in a corner or text outside the safe box. Opening `scene/index.html#debug` shows the safe box. Don't install anything to do this. (During a zoom through a letter the letter fills the frame on purpose; that's fine as long as you hide it once the background takes over.)

## Step 6: Sound effects (scene/sound.json)

Wrenn adds music and sound effects after the render. Music is added for you: don't pick or make any. Keep your hits on a steady 0.5 second grid where you can (0.5, 1.0, 1.5 ...), so the video feels on the beat.

Your job is to say where the sound effects go. Write `scene/sound.json` next to `scene/index.html`:

```json
{ "hits": [ { "t": 0.5, "type": "pop" }, { "t": 2.0, "type": "whoosh" } ] }
```

- `t` is the second on the timeline where the sound lands. It must match the exact time of that moment in your timeline (the same number you passed to `tl.to` or `Wrenn.reveal`), not a guess.
- One hit for each moment that matters: every phrase landing, slams, color cuts, collapses, zooms and the ending. Skip the small stuff (drifts, each single letter of a stagger or scramble).
- Types, used with taste:
  - `whoosh`: big moves (a zoom through a letter, a color block wiping, a collapse). It peaks at `t`.
  - `pop`: words and phrases landing, a word swap.
  - `click`: a scramble settling, a small snap.
  - `impact`: the biggest slam or the brand name at the end. One or two at most.
  - `riser`: builds up and ends at `t`. One or two at most, for example building into the ending (same `t` as the impact).
- Not too many: about one hit every 0.5 to 1.5 seconds. Never more than 60. Two hits less than 0.2 seconds apart sound messy, so keep the more important one (a riser ending on its impact is fine).

Tip: `Wrenn.hit(t, type)` notes a hit and gives `t` back, so you can write it right where the tween is: `tl.to(word, {...}, Wrenn.hit(T_SLAM, "impact"))`. After `Wrenn.install()`, `Wrenn.sound()` (also `window.WRENN_SOUND`) returns the sorted list. The page can't write files, so you still write `scene/sound.json` yourself, with the same times.

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
