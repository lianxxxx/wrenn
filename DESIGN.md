---
name: Wrenn
description: No prompts. Just render.
colors:
  navy: "#023047"
  navy-body: "#2A4A5A"
  cream: "#FFF8EC"
  white: "#FFFFFF"
  red: "#D62828"
  orange: "#F77F00"
  lemon: "#F3DA2E"
  lime: "#82B51F"
  sky: "#8ECAE6"
  teal: "#219EBC"
  golden: "#E0B800"
  sky-soft: "#DCEFF8"
  line: "#E8DDCB"
typography:
  display:
    fontFamily: "Bubblegum Sans, system-ui, sans-serif"
    fontSize: "5rem"
    fontWeight: 400
    lineHeight: 1.05
  h2:
    fontFamily: "Bubblegum Sans, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 400
    lineHeight: 1.05
  h3:
    fontFamily: "Bubblegum Sans, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.1
  button:
    fontFamily: "Bubblegum Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1
  lead:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.3
  small:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "10px"
  md: "18px"
  lg: "26px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  3xl: "110px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.cream}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 22px"
  button-on-dark:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 22px"
  card:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "28px 22px"
  navbar:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
---

# Wrenn design system

Source of truth for colors, fonts, spacing and UI rules. Read this before building any screen, page or video template. If something here and a skill disagree, this file wins, then Lian decides.

Fonts are self-hosted from `brand/fonts/` (never the Google Fonts CDN). The mascot and app icon drafts are in `brand/mascot/`. Private inspo and mocks (including the visual brand guide `inspo/mocks/brand-guide.html`) are in `inspo/` (gitignored).

## Overview

**Vibe: alive and playful.** Every choice (color, motion, layout) should make Wrenn feel more alive, not calmer or more corporate.

Wrenn is a free desktop app that turns screenshots into showreel videos with no prompts. The brand is a small, loud, singing bird: the mascot is a wren inspired by the **Ibong Adarna**, the Filipino folklore bird whose song changes its colors. Its 6 tail feathers are the 6 blob colors.

Signature elements:
- **Blob words:** key words sit on their own color blobs that look painted with a marker or highlighter: bumpy hand-made edges, tight around the word, barely tilted.
- **Soft organic edges:** clouds, scallops, blobs. Almost no hard straight section edges.
- **Hand-drawn accents, used sparingly:** a wobbly circle on the active nav item, small sparkle or "pop" lines.
- **Simple centered sections:** big headline, one short line, one button. No eyebrow labels.

## Colors

Two colors do the main work. Six more are for blobs, cards and highlights.

**Core**
- **Navy `#023047`:** all text, headlines, navbar, footer, and main buttons. Never pure black.
- **Background: cream `#FFF8EC` or white `#FFFFFF`. NOT DECIDED.** Lian picks when building the landing page. Use one `bg` token everywhere so switching is a one-line change. Default to cream until then.
- **Navy body `#2A4A5A`:** secondary text (sub descriptions, paragraphs) on light backgrounds.

**Blob colors** (blobs, cards, highlights, mascot tail)

| Token | Hex | Type | Text on it |
|---|---|---|---|
| red | `#D62828` | dark | white / cream |
| teal | `#219EBC` | dark | white |
| orange | `#F77F00` | light | navy |
| lemon | `#F3DA2E` | light | navy |
| lime | `#82B51F` | light | navy |
| sky | `#8ECAE6` | light | navy |

**Sky soft `#DCEFF8`:** the hero card background and soft cloud tints. Not a blob color.

**Golden `#E0B800`:** the mascot's beak and music note on light backgrounds (lemon is too faint on cream).

**Balance on a page:** about 60% background, about 28% navy, small pops of the blob colors.

**Blob text color depends on the background:**
- **Light background:** navy text on light blobs, white text on dark blobs (red, teal). Either mostly light blobs, or alternating dark / light blobs.
- **Dark background (navy, dark video):** all white text, only on red and teal blobs, alternating.

## Typography

Two fonts only.

- **Bubblegum Sans** (`BubblegumSans-Regular.woff2`, 400 only): logo, headlines, blob words, buttons, card titles. Short and loud, up to about 6 words.
- **Figtree** (`Figtree-Variable.woff2`, 300 to 900): descriptions, paragraphs, labels, inputs, all app UI text people read.

Scale (see tokens): display 72 to 96px, h2 48 to 64px, h3 28 to 32px, button 18 to 20px (Bubblegum); lead 18 to 20px, body 16 to 17px, label 14 to 15px / 600, small 13px / 500 (Figtree).

Headlines are navy. To add color to a headline, make one word orange or put it on a blob; never make the whole headline orange (2.5:1 contrast on cream).

## Layout

- **Every landing section follows one pattern:** big Bubblegum headline, one short Figtree line, one button. **No eyebrow** (no small pill or label above the headline; Lian removed them). Centered by default. **Exceptions (inspo: Little Bloom):** "From photos to video" is a split section (left-aligned headline, two staggered frames with the mascot perched on one, a column of white feature cards on the right). "Made for every feed" sits on a full-width sky-soft band with a cloud-shaped top edge, left-aligned headline, frames at staggered heights with marker-blob sticker labels on their bottom edge, mascot perched on the first. Nothing else unless the section needs cards or a demo.
- **Hero:** sits inside one rounded card (`rounded 28px`, background `sky-soft #DCEFF8`) with a small gap of page background around it. **Only the hero gets a card**; every other section sits directly on the page background, so it doesn't get too much. Inside: centered navy Bubblegum headline with **one blob only, on "render."** (teal, white text). Lian compared all blobs, no blobs and one blob in red, lemon, lime and teal, and picked this. Short sub, one button, white clouds floating in the background, and the product (a 9:16 video frame) peeking up from the bottom edge of the card with small "pop" lines.
- **Cards:** one row like a fanned hand of cards (inspo: Detach). The middle card is straight and in front, the side cards overlap behind it. **On phones** the side cards tilt outward (-8° and 8°) at **staggered heights**: the left card a bit higher, the right card lower. **On desktop** both side cards tilt the same way, clockwise (about 6°). On phones they **stay in a row** and the side cards get cut off by the screen edge (never stack them). On desktop (inspo: Little Bloom) the cards are bigger, the side cards sit **higher** and the middle card sits **lower**, still in front. Each card a different blob color. Not a stiff grid.
- **Navbar:** lives inside the hero card. Logo (bird + "wrenn") on the left. On the right, links inside a big cream cloud that hangs from the top and is flush with the card's right edge (4 large uneven bumps along the bottom, a round lobe on the left). Navy links, navy Download button with no shadow.
- **Footer:** navy, with round cloud bumps rising from its top edge (the shared `CloudEdge`, same shape as the "Made for every feed" band, never small hanging scallops), simple link columns, giant "wrenn" wordmark across the bottom with the mascot perched on the letters.
- Generous vertical spacing between sections (`3xl`). Max content width about 1160px. Phone-first: everything must work at 360px wide with 16px side padding.

## Elevation & Depth

Mostly flat. Depth comes from overlap and tilt, not heavy shadows.
- **Buttons:** flat, no shadow (Lian removed it from both the hero and navbar buttons). A small press-down on click (`translate-y 2px`) is fine.
- **Cards:** one soft shadow `0 10px 30px rgba(0, 0, 0, 0.08)`.
- No glassmorphism, no glows, no gradients.

## Shapes

- **Blobs (marker highlight):** a rounded shape with uneven corners (e.g. `45% 38% 42% 40% / 50% 46% 54% 50%`), roughened by an SVG noise filter (`feTurbulence` fractalNoise, baseFrequency `0.035`, numOctaves `2`, then `feDisplacementMap` scale `14`) so the edges look bumpy and hand-painted. Apply the filter to the color shape only, never the text. Use a different noise seed for neighbouring blobs. Tilt between -1.5° and 1.5°. Reference: `web/src/app/page.tsx` (`Blobs`, `MarkerFilters`).
- **Cloud edge:** round, uneven bumps rising up from the top of a colored block (component `CloudEdge` in `web/src/components/cloud-edge.tsx`). Used on the "Made for every feed" band and the footer. Not small, even, hanging scallops. Never a hard straight edge between two colored sections.
- **Clouds:** soft, light tint (e.g. `#DCEFF8` on cream), floating in the hero background.
- **W brush:** many thick, rounded strokes zig-zagging, **behind the button area, reaching up to the sub** (not behind the headline, about 640px wide, never wider than the screen; the rounded ends must show in full, never clipped), overlapping like a big crayon scribble (inspo: brush-stroke bg, shape only). Light sky at low opacity. Used in **two places only** (component `Scribble`): behind the FAQ list (stretched to cover every question, not the headline or sub) and behind the Download button.
- **Hand-drawn circle:** wobbly, not a perfect oval. **Active nav item only.** Can draw itself in.
- Buttons are full pills (`rounded.pill`). Cards use `rounded.lg`.

## Components

- **Primary button:** navy, cream text, Bubblegum, pill, no shadow. On a navy background it flips to cream with navy text (`button-on-dark`).
- **Ghost button:** transparent, 2px navy border, navy text.
- **Blob word:** one word per blob, Bubblegum, padding about `0.08em 0.4em 0.14em`, marker-highlight shape (see Shapes), text color by the blob rules in Colors.
- **Card:** blob color background, Bubblegum title, Figtree description, `rounded.lg`, tilted in a fanned group.
- **Navbar:** cream cloud inside the hero card, navy Figtree links, hand-drawn circle on the active link, navy Download button (no shadow).
- **Mascot:** navy body, golden beak and note, 6-color tail. App icon version: bird on a cream blob in a navy squircle, no note.

**Motion** (follow the Emil Kowalski skills for craft):
- Blob words pop in one by one, on the beat in videos.
- The mascot's music note changes color each time it sings, cycling through the tail colors (the Adarna story).
- Purposeful only: easing with a little overshoot, no generic fades on everything.

## Do's and Don'ts

**Do**
- Keep it alive and playful: tilt, overlap, color pops.
- Use navy for text and buttons, Bubblegum for short loud text, Figtree for everything people read.
- Keep body text 16px or bigger.
- Make neighbouring blobs and cards different colors.
- Keep text big and readable on mute in videos, and away from the corners.

**Don't**
- Eyebrow labels (small pills or text above a section headline). The headline stands alone.
- Pure black text, gradients between brand colors, glassmorphism.
- Red and orange right next to each other.
- White text on sky, lemon, lime or orange.
- Bubblegum for paragraphs, fake bold on Bubblegum, ALL CAPS headlines, or a third font.
- Smooth ovals, perfect pills or circles as blobs (they look digital, not hand-made), blobs on every heading, or more than 3 blob colors in one line.
- The W brush anywhere except the FAQ list and the Download button, or the hand-drawn circle anywhere except the active nav item.
- Copying any inspo site's layout, illustrations or colors 1:1.
