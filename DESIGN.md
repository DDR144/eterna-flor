---
version: alpha
name: Pastel Candy
description: Marshmallow pink, plum ink, one blossom accent.
colors:
  ink: "#3A2747"
  ink-muted: "#6E5A7A"
  surface: "#FFFFFF"
  petal: "#FBE4EE"
  petal-deep: "#ECC0D5"
  line: "#DFBCCF"
  line-strong: "#C99AB4"
  lilac: "#9E82B5"
  blossom: "#FF8AB8"
  blossom-deep: "#F2659C"
  success: "#1F7A52"
  warning: "#8A5A12"
  danger: "#A4262F"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 2.25rem
    fontWeight: 600
    letterSpacing: "-0.02em"
  body:
    fontFamily: Nunito
    fontSize: 1rem
    lineHeight: 1.6
  label:
    fontFamily: Nunito
    fontSize: 0.75rem
    letterSpacing: "0.04em"
rounded:
  tight: 12px
  soft: 20px
  lush: 32px
components:
  button-primary:
    backgroundColor: "{colors.blossom}"
    textColor: "{colors.ink}"
    rounded: "{rounded.soft}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lush}"
    padding: 24px
---
## Overview

A candy-counter palette: marshmallow pink surfaces, plum ink for text, and exactly one blossom accent that drives interaction. Rounded everything; nothing sharp.

There is no mint and no butter-yellow in the palette. Do not invent them.

## Colors

The palette is built around a high-contrast plum neutral and a single accent. The names below are the ones used in code (`app/globals.css`, `@theme`); an implementation with the exact classes and contrast measurements lives in `design/system.md`.

- **`ink` (`#3A2747`):** Headlines, core text, the text on the primary button, and focus outlines.
- **`ink-muted` (`#6E5A7A`):** Secondary text, captions, ghost buttons, neutral badges. 5.7:1 on `surface`.
- **`surface` (`#FFFFFF`):** Card, popover and input surfaces.
- **`petal` (`#FBE4EE`):** The page foundation and the hover fill for secondary/ghost buttons.
- **`petal-deep` (`#ECC0D5`), `line` (`#DFBCCF`), `line-strong` (`#C99AB4`):** The surface hierarchy — deeper hover fills, default borders, control borders, in that order.
- **`lilac` (`#9E82B5`):** Borders and decorative fills. **Never text**: it reaches only 2.7:1 on `petal`, below the 4.5:1 that WCAG AA requires.
- **`blossom` (`#FF8AB8`):** The sole driver for interaction. `blossom-deep` (`#F2659C`) is its hover state.
- **`success` (`#1F7A52`), `warning` (`#8A5A12`), `danger` (`#A4262F`):** Status text and badges.

## Typography

- **display:** Fraunces, letter-spacing `-0.02em`. The largest step actually used is 2.25rem (`text-4xl`) in page headings; there is no 4rem display size.
- **body:** Nunito 1rem, line-height 1.6
- **label:** Nunito 0.75rem, letter-spacing `0.04em`

Both fonts load through `next/font/google` in `app/layout.tsx`. No second font loader.

## Spacing and radius

- **Spacing:** no project tokens. Tailwind's default scale (`gap-2`, `p-4`, `px-6`, …).
- **Radius:** `tight` 12px (inputs, small buttons), `soft` 20px (buttons), `lush` 32px (cards, empty states). The Tailwind defaults `rounded-sm/md/lg` are intentionally left alone.

## Do's and Don'ts

- **Do** use `blossom` for exactly one action per screen.
- **Do** let `petal` and `surface` carry the composition — negative space is a feature.
- **Do** keep every text/background pair at 4.5:1 or better. The primary button pairs `blossom` with `ink` as text (6.1:1); white on `blossom` is 2.2:1 and is not allowed.
- **Do** use `ink-muted` for captions, never `lilac`.
- **Don't** introduce gradients, shadows or a second accent. This system is flat on purpose.
- **Don't** write hex values in JSX. Use the tokens: `bg-blossom`, `text-ink-muted`, `border-line-strong`, `rounded-lush`.
