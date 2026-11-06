---
version: alpha
name: Pastel Candy
description: Marshmallow pink, mint, butter.
colors:
  primary: "#3A2747"
  secondary: "#9E82B5"
  tertiary: "#FF8AB8"
  neutral: "#FFF3F7"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 4rem
    fontWeight: 600
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Fraunces
    fontSize: 2.25rem
    fontWeight: 600
  body:
    fontFamily: Nunito
    fontSize: 1rem
    lineHeight: 1.6
  label:
    fontFamily: Nunito
    fontSize: 0.75rem
    letterSpacing: "0.04em"
rounded:
  sm: 12px
  md: 20px
  lg: 32px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
---
## Overview

A candy-counter palette with soft pinks, mint, and butter-yellow. Rounded everything; nothing sharp.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`#3A2747`):** Headlines and core text.
- **Secondary (`#9E82B5`):** Borders and decorative fills. **Never text**: it reaches only 2.9:1 on Neutral and 2.7:1 on the surface, below the 4.5:1 that WCAG AA requires. Secondary text uses `ink-muted` (`#6E5A7A`, 5.7:1).
- **Tertiary (`#FF8AB8`):** The sole driver for interaction. Reserve it.
- **Neutral (`#FFF3F7`):** The page foundation.

## Typography

- **display:** Fraunces 4rem
- **h1:** Fraunces 2.25rem
- **body:** Nunito 1rem
- **label:** Nunito 0.75rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Do** keep every text/background pair at 4.5:1 or better. The primary button pairs Tertiary with Primary as text (`6.1:1`); white on Tertiary is `2.2:1` and is not allowed.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.
- **Don't** use Secondary (`#9E82B5`) for text. It is a border and fill color only.
