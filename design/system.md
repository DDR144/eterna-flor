# EternaFlor — Design system (Pastel Candy)

Synchronized from the implementation on `main` (the `feat/ui-refresh` work, merged). This file records **only values that exist in the sources** after the migration unified the two previous visual systems.

Sources read:

- `eterna-flor-front/app/globals.css` — all `@theme` tokens, legacy component classes, keyframes and `prefers-reduced-motion` guard
- `eterna-flor-front/app/layout.tsx` — Fraunces + Nunito loaded at the root
- `eterna-flor-front/components/ui/*.tsx` — `Button`, `Card` (+ `CardHeader`/`CardBody`/`CardFooter`), `Badge`, `Field`/`Input`/`Select`/`Textarea`, `EmptyState`, `Spinner`, `Icon`
- `eterna-flor-front/lib/format.ts` — `money`, `percent`, `shortDate`
- `DESIGN.md` — declared intent, now aligned with the contrast corrections in L10/L11/L19

---

## Colors

Source: `eterna-flor-front/app/globals.css` (`@theme`).

| Token | Value | Usage in sources |
| --- | --- | --- |
| `--color-ink` | `#3a2747` | Headlines, core text, primary button text, focus outlines (`focus-visible:outline-ink`) |
| `--color-ink-muted` | `#6e5a7a` | Secondary text, muted captions, ghost buttons, badges (`tone="neutral"`) — 5.7:1 on `surface` |
| `--color-surface` | `#ffffff` | Card, popover and input surfaces |
| `--color-petal` | `#fbe4ee` | Page background (`body`), hover fills for secondary/ghost buttons |
| `--color-petal-deep` | `#ecc0d5` | Deeper surface: `Badge` `tone="neutral"` background |
| `--color-line` | `#dfbccf` | Default borders (`border-color`, card borders) |
| `--color-line-strong` | `#c99ab4` | Input/control borders, secondary button borders |
| `--color-lilac` | `#9e82b5` | Borders and decorative fills only — **FORBIDDEN as text** (2.7:1 on `petal`, below WCAG AA 4.5:1) |
| `--color-blossom` | `#ff8ab8` | Primary actions, accent badges — the sole interactive accent |
| `--color-blossom-deep` | `#f2659c` | Hover state for primary buttons and blossom surfaces |
| `--color-success` | `#1f7a52` | Success text, success-badge text |
| `--color-warning` | `#8a5a12` | Warning text, warning-badge text |
| `--color-danger` | `#a4262f` | Error text, danger badges, required-field asterisk, invalid control outlines |

### Contrast rules (current, not gaps)

- **Primary button** pairs `blossom` (`#ff8ab8`) background with `ink` (`#3a2747`) text for 6.1:1. White on `blossom` is 2.2:1 and is **not allowed** (source: `eterna-flor-front/components/ui/Button.tsx` + `DESIGN.md`).
- **Secondary text** uses `ink-muted` (`#6e5a7a`, 5.7:1 on `surface`). `lilac` (`#9e82b5`) is not used for captions or metadata because it fails WCAG AA (source: `eterna-flor-front/app/globals.css` comment block + `DESIGN.md`).
- `lilac` is reserved for borders and decorative fills only (source: `DESIGN.md` + `globals.css`).

---

## Typography

Source: `eterna-flor-front/app/layout.tsx` + `eterna-flor-front/app/globals.css`.

| Token | Value | Usage |
| --- | --- | --- |
| `--font-display` | `var(--font-fraunces), Georgia, "Times New Roman", serif` | Headings (`h1`, `h2`, `h3`), `CardHeader` title, `EmptyState` title |
| `--font-body` | `var(--font-nunito), ui-sans-serif, system-ui, sans-serif` | Body text, buttons, inputs, badges, tables |

`Fraunces` and `Nunito` are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables. There is no second font loader: the catalog inherits the same root fonts.

No explicit type scale is declared in CSS. Call sites use Tailwind utilities; the largest observed display step is `text-4xl` (2.25rem) in page headings.

---

## Spacing

No project spacing tokens. Tailwind's default scale is used (`gap-2`, `p-4`, `px-6`, etc.).

Source: `eterna-flor-front/components/ui/*.tsx`.

---

## Radius

Source: `eterna-flor-front/app/globals.css` (`@theme`).

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-tight` | `12px` | Inputs, selects, textareas, small buttons (`size="sm"`), icon buttons |
| `--radius-soft` | `20px` | Buttons (`size="md"`), secondary buttons, ghost buttons |
| `--radius-lush` | `32px` | Cards, empty states |

The Tailwind default `--radius-sm/md/lg` tokens are intentionally **not** overwritten, because overriding them would have changed `rounded-lg` on screens outside the migration scope (source: `globals.css` comment).

---

## Shadows

No shadow tokens are declared in `@theme`. The component layer does not use shadows; surfaces are defined by `surface`/`petal` contrast, border, and radius only.

Source: `eterna-flor-front/components/ui/*.tsx`.

---

## Component rules

Source: `eterna-flor-front/components/ui/*.tsx`.

| Component | Props / variants | Definition |
| --- | --- | --- |
| `Button` | `variant`: `primary` (default), `secondary`, `ghost`, `danger`; `size`: `sm`, `md` (default), `icon` | Base: `inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50`. `primary` → `bg-blossom text-ink hover:bg-blossom-deep active:scale-[0.98]`; `secondary` → `border border-line-strong bg-surface text-ink hover:bg-petal`; `ghost` → `text-ink-muted hover:bg-petal hover:text-ink`; `danger` → `border border-danger/40 bg-surface text-danger hover:bg-danger/5`. Sizes: `sm` (`h-9 rounded-tight px-3 text-sm`), `md` (`h-11 rounded-soft px-5 text-sm`), `icon` (`h-9 w-9 rounded-tight`). |
| `Card` | `children`, `className` | `rounded-lush border border-line bg-surface`. |
| `CardHeader` | `title`, `description?`, `action?` | Flex row with bottom border `line`; title in `font-display text-base font-semibold text-ink`; description in `text-sm text-ink-muted`. |
| `CardBody` | `children`, `className?` | `px-6 py-4`. |
| `CardFooter` | `children` | Flex row with top border `line`, right-aligned gap-2; `px-6 py-4`. |
| `Badge` | `tone`: `neutral` (default), `accent`, `success`, `warning`, `danger` | `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold`. Tones: `neutral` → `border-line-strong bg-petal-deep text-ink`; `accent` → `border-transparent bg-blossom text-ink`; `success` → `border-transparent bg-success/10 text-success`; `warning` → `border-transparent bg-warning/10 text-warning`; `danger` → `border-transparent bg-danger/10 text-danger`. |
| `Field` | `label`, `name`, `children` (control), `hint?`, `error?`, `required?` | Wraps label + control + message. Generates matching `htmlFor`/`id` via `useId`. Injects `name`, `required`, `aria-invalid`, `aria-describedby` into the child control. Error announced with `role="alert"`. |
| `Input` | standard `<input>` props | `w-full rounded-tight border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors duration-150 placeholder:text-ink-muted/60 focus-visible:border-blossom focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blossom aria-invalid:border-danger aria-invalid:focus-visible:outline-danger`. |
| `Select` | standard `<select>` props | Same styling as `Input`. |
| `Textarea` | standard `<textarea>` props | Same styling as `Input`. |
| `EmptyState` | `title`, `description?`, `action?` | `role="status"`; `rounded-lush border border-dashed border-line-strong px-6 py-16 text-center`; title in `font-display text-lg font-semibold text-ink`; description in `text-sm text-ink-muted`. |
| `Spinner` | `label?` (default `"Cargando"`) | `role="status"`; spinning SVG + text `text-sm text-ink-muted`. Label rendered as `"{label}…"`. |
| `Icon` | `name`, `className?` (default `"h-5 w-5"`), SVG props | Stroke icons, `aria-hidden`, `focusable="false"`, `viewBox="0 0 24 24"`. Available names: `ramos`, `materias`, `pedidos`, `reportes`, `catalogo`, `salir`, `mas`, `cerrar`, `basura`, `izquierda`, `derecha`. |

### Helpers

Source: `eterna-flor-front/lib/format.ts`.

| Helper | Output | Example |
| --- | --- | --- |
| `money(value: number)` | `es-PE` currency (`PEN`) | `185` → `S/ 185.00` |
| `percent(value: number)` | `es-PE` decimal + space + `%` | `59.63` → `59.6 %` |
| `shortDate(value?: string \| null)` | `es-PE` `day short-month`, or `null` if invalid/absent | `"2026-02-12"` → `"12 feb"` |

---

## Motion

Source: `eterna-flor-front/app/globals.css`.

| Name | Utility | Definition |
| --- | --- | --- |
| `fadeIn` | `.animate-fade-in` | `opacity: 0 → 1`, 160ms `ease-out` |
| `slideIn` | `.animate-slide-in` | `opacity: 0 → 1`, `translateX(-8px) → 0`, 160ms `ease-out` |
| `cardIn` | `.animate-card-in` | `opacity: 0 → 1`, 240ms `ease-out forwards` (deprecated, kept for `catalogo/` until it migrates) |

`prefers-reduced-motion: reduce` sets `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important`, and `scroll-behavior: auto !important` for all elements.

All transitions list explicit properties (no `transition-all`) (source: `globals.css`, `components/ui/*.tsx`).

---

## Legacy classes

Source: `eterna-flor-front/app/globals.css` (`@layer components`).

The pre-migration utility classes still exist and are remapped to the new tokens so screens not yet on `components/ui` inherit the unified palette:

- `.btn-primary` → `bg-blossom text-ink hover:bg-blossom-deep`
- `.btn-secondary` → `border border-line-strong bg-surface text-ink hover:bg-petal`
- `.btn-ghost` → `text-ink-muted hover:bg-petal hover:text-ink`
- `.input-field` → same styling as `Input`
- `.card` / `.card-hover` → `rounded-lush border border-line bg-surface`, hover `border-line-strong`

These classes are **deprecated**. New code should use `components/ui`, not the legacy layer.

---

## Estado

The two previous visual systems (stone/rose + Geist in the admin, Pastel Candy hex inline in the catalog) were unified during `feat/ui-refresh`. The token source of truth is now the `@theme` block in `eterna-flor-front/app/globals.css`, the admin shell and the `ramos` pilot were rebuilt on `components/ui`, and `DESIGN.md` was aligned with the contrast corrections (L19).

Genuinely open items:

1. **`next/image` is deferred.** Photos come from Cloudinary, which requires `remotePatterns` in `next.config.ts`; that change was out of scope for the refresh. Current images use plain `<img>` with explicit `width`/`height`.
2. **No frontend test runner.** `eterna-flor-front/package.json` does not define `test` or install a framework (S11). Verification is `tsc --noEmit`, `pnpm build` and `pnpm lint`.
3. **`cardIn` animation survives as legacy.** It is kept only for the still-unmigrated `catalogo/` surface and is not used by `components/ui`.
