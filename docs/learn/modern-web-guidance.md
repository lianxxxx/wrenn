# What we learned from Modern Web Guidance

A short note on how we used Modern Web Guidance to update the Wrenn landing page (`web/`), and what changed.

## What it is

Modern Web Guidance is a set of small guides for building websites the modern way. The Chrome team wrote it, with guides from Edge, Firefox and MDN too.

Each guide covers one job, like "build an accordion" or "add dark mode". It shows the new, simpler way to do it with plain HTML and CSS. It also says how well browsers support each feature, using **Baseline**:

- **Widely available:** works in all main browsers for 2.5+ years. Safe to use.
- **Newly available:** works in all main browsers, but only recently. Fine with a fallback.
- **Limited availability:** not in every browser yet. Only use it as a bonus that is OK to miss.

## How an agent (like Claude) uses it

It's a command line tool. You don't install it; `npx` runs it.

1. **Scan for old patterns.** This reads your code and lists things that have a newer way:
   ```
   npx modern-web-guidance@latest legacy-scan web/src
   ```
2. **Search for a topic.** This gives a list of guide ids:
   ```
   npx modern-web-guidance@latest search "accordion details summary"
   ```
3. **Read one guide.** This prints the full guide, with code and browser support:
   ```
   npx modern-web-guidance@latest retrieve accordion
   ```

When a skill for it is installed, it can also trigger on its own when you ask an agent to build a common piece of UI (a toggle, an accordion, a dark mode), so the agent reads the guide first instead of guessing.

The guides give advice, not orders. When a guide disagrees with `DESIGN.md`, `DESIGN.md` wins (see dark mode below).

## What we changed

| What | Old way | New way | Why | Guide id |
|---|---|---|---|---|
| Heading line breaks | Browser fills each line as much as it can, so a heading could end with one lonely word. | `text-wrap: balance` on `h1`, `h2`, `h3`. | Lines come out about the same length. Looks more designed, no JS. | `improve-text-layout-and-legibility` |
| Paragraph line breaks | Same: a paragraph could end with one word on its own line. | `text-wrap: pretty` on `p` and `li`. | The browser looks at the last few lines and avoids that. Browsers that don't support it just wrap normally. | `improve-text-layout-and-legibility` |
| Dark mode and the browser | Only our colors changed. The scrollbar and other browser parts stayed light on the dark page. | `color-scheme: light` on `:root`, `color-scheme: dark` on `:root.dark`. | Tells the browser which theme we're in, so its own parts match. | `dark-mode`, `dark-mode-toggle` |
| Image file sizes | `next/image` with only `width` and `height`. For a 2172px wide logo shown at about 144px, the browser downloaded a 3840px file. | Added `sizes="144px"` (and similar) to every image. | Now Next makes a full list of sizes and the browser picks a small one (256px for the logo). Much less to download. | `optimize-image-priority` (plus Next.js docs for `sizes`) |
| Nav logo priority | `priority` prop. Next.js 16 marks it as old (deprecated). | `loading="eager"`. | The logo is at the top, so it should not wait to load. But the big headline text is the largest thing on screen, not the logo, so it doesn't need `fetchpriority="high"`. The guide says to save that for the one main image. | `optimize-image-priority` |
| FAQ open and close | `<details>` opened and closed instantly. | The answer (`::details-content`) slides open with `interpolate-size`, only when the visitor allows motion. | Smoother. Still no JavaScript. Browsers without support just open instantly, like before. | `accordion` |

### Where we didn't follow the guide

- **Dark mode default.** The guide says to follow the device setting by default. `DESIGN.md` says Wrenn is light by default and only goes dark with the toggle. `DESIGN.md` wins, so we only added `color-scheme` and kept our toggle as it is.

## What we skipped, and why

- **Scroll reveal with CSS scroll-driven animations.** Our reveals play once, with a 70ms stagger across a group. A scroll-driven animation is tied to the scroll position, so it would feel different. It also only became Baseline in October 2026 (newly available). Our current code already respects reduced motion and works without JS.
- **`sibling-index()` for the loading dots delay.** The scan flagged the `:nth-child` delay rules. `sibling-index()` is only newly available (August 2026), so we'd have to keep the old rules as a fallback anyway. No real gain yet. Worth another look once it's widely available.
- **One-at-a-time FAQ (`name` on `details`).** The guide itself says to avoid it: people sometimes want two answers open.
- **Moving the FAQ arrow next to the question.** The guide prefers that, but it changes the look. That's a design choice for Lian.
- **Custom focus rings.** The site uses the browser's default focus ring, which already only shows for keyboard users. A branded ring is a design choice for later.
