# Frontend Agent Guide

See root `../AGENTS.md` for monorepo structure and commands.

## Important: This is NOT the Next.js you know

Next.js 16 has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Quick Commands
```bash
pnpm dev    # next dev (port 3000)
pnpm build  # next build
pnpm lint   # eslint-config-next
```

## Key Conventions
- Uses Tailwind CSS 4 with `@tailwindcss/postcss` (no `tailwind.config.js`)
- Uses React 19
- Read `node_modules/next/dist/docs/` for API reference