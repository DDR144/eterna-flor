# Eterna Flor - Agent Guide

## Structure
Monorepo with two packages:
- `eterna-flor-back/` — NestJS 11 backend (Nest CLI, Jest, ESLint + Prettier)
- `eterna-flor-front/` — Next.js 16 frontend (Tailwind CSS 4, ESLint)

## Commands

### Backend (`eterna-flor-back/`)
```bash
pnpm install
pnpm run start:dev   # watch mode
pnpm run build       # nest build
pnpm run lint        # eslint + prettier
pnpm run test        # jest (src/**/*.spec.ts)
pnpm run test -- src/path/to/file.spec.ts  # single test
pnpm run test:e2e    # jest with test/jest-e2e.json
```

### Frontend (`eterna-flor-front/`)
```bash
pnpm install
pnpm dev             # next dev (port 3000)
pnpm build           # next build
pnpm lint            # eslint-config-next
```

## Notes
- Backend uses Jest with `ts-jest`; config is inline in `package.json`, coverage goes to `../coverage/`.
- Backend uses `nodenext` module resolution (unusual for NestJS).
- Backend eslint uses `typescript-eslint` with type checking enabled (`projectService: true`); `@typescript-eslint/no-explicit-any` is off.
- Frontend uses Next.js 16 — **read `node_modules/next/dist/docs/` before writing code**; APIs and conventions differ from training data.
- Frontend uses Tailwind CSS 4 with `@tailwindcss/postcss` (not `tailwind.config.js`).
- No root `package.json`; each package is managed independently (pnpm-workspace.yaml is misplaced in `eterna-flor-front/`).
- No `node_modules` are committed; run `pnpm install` in each package before first use.
