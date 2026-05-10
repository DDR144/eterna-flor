# Eterna Flor - Agent Guide

## Structure
Monorepo with two packages:
- `eterna-flor-back/` — NestJS 11 backend (Nest CLI, Jest, ESLint + Prettier, Prisma + MySQL)
- `eterna-flor-front/` — Next.js 16 + React 19 frontend (Tailwind CSS 4)

## Commands

### Backend
```bash
cd eternally-flor-back && pnpm install
pnpm run start:dev   # watch mode
pnpm run build       # nest build
pnpm run format     # prettier --write
pnpm run lint       # eslint + prettier --fix
pnpm run test       # jest (src/**/*.spec.ts)
pnpm run test -- src/path/to/file.spec.ts  # single test
pnpm run test:e2e   # jest with test/jest-e2e.json
```

Prisma (in `eterna-flor-back/`):
```bash
pnpm prisma generate   # generate client from schema
pnpm prisma migrate dev --name init  # create migration
pnpm prisma db push    # push schema to DB
pnpm prisma studio    # visual DB viewer
```

### Frontend
```bash
cd eternally-flor-front && pnpm install
pnpm dev      # next dev (port 3000)
pnpm build    # next build
pnpm format   # prettier --write
pnpm lint     # eslint-config-next
```

## Notes
- **Run lint before test** when modifying backend (lint is not prepended to test in CI).
- Backend uses `nodenext` module resolution — unusual for NestJS.
- Backend eslint uses `typescript-eslint` with type checking enabled (`projectService: true`); `@typescript-eslint/no-explicit-any` is off.
- Backend Prisma: MySQL database; schema in `prisma/schema.prisma`; client needs `prisma generate` after schema changes.
- Frontend uses Next.js 16.2.4 + React 19 — **read `node_modules/next/dist/docs/` before writing code**; APIs differ from training data.
- Frontend uses Tailwind CSS 4 with `@tailwindcss/postcss` (no `tailwind.config.js`).
- No root `package.json`; each package is independent. Run `pnpm install` in each package.
- No `node_modules` committed.
- Database requires `DATABASE_URL` in `eterna-flor-back/.env`.