# Frontend Agent Guide

See root [`../AGENTS.md`](../AGENTS.md) for the monorepo structure, commands and the notes that apply to both packages.

## Important: This is NOT the Next.js you know

Next.js 16 has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Quick Commands
```bash
pnpm dev    # next dev (port 3000)
pnpm build  # next build
pnpm start  # next start
pnpm lint   # eslint
```
There is no `format` script and no test runner in this package.

## Key Conventions
- Tailwind CSS 4 with `@tailwindcss/postcss`; there is no `tailwind.config.js`. Tokens are the `@theme` block in `app/globals.css`.
- React 19, App Router. Routes live under `app/`: `/` (redirect), `/login`, `/catalogo`, `/admin` with `ramos`, `materias-primas`, `pedidos`, `reportes`.
- Use `components/ui/` instead of new one-off markup; never hardcode hex values, use the tokens.
- Data access through `lib/api.ts` (`NEXT_PUBLIC_API_URL`, falling back to `http://localhost:3001`); formatting through `lib/format.ts`; size labels through `lib/tamanos.ts`.
- Read `design/system.md` before changing anything visual: it records the tokens and component rules that are actually implemented.
