# Eterna Flor - Agent Guide

## Structure
Monorepo with two independent packages (no root `package.json`):
- `eterna-flor-back/` — NestJS 11 backend (Nest CLI, Jest, ESLint + Prettier, Prisma + PostgreSQL)
- `eterna-flor-front/` — Next.js 16 + React 19 frontend (Tailwind CSS 4, App Router)

Install and run commands inside each package; `pnpm install` in each.

## Commands

### Backend (from `eterna-flor-back/`)
```bash
pnpm install
pnpm run start:dev   # nest start --watch, port 3001
pnpm run start:prod   # node dist/main (production entry point)
pnpm run build       # prisma generate && nest build
pnpm run lint        # eslint "{src,apps,libs,test,prisma}/**/*.ts" --fix
pnpm run format      # prettier --write over src, test and prisma
pnpm run test        # jest, src/**/*.spec.ts
pnpm run test -- src/path/to/file.spec.ts  # single test
pnpm run test:e2e    # jest with test/jest-e2e.json, needs a local database
```

Prisma (in `eterna-flor-back/`):
```bash
pnpm exec prisma generate          # regenerate client after schema changes
pnpm exec prisma migrate dev       # create + apply a migration locally
pnpm exec prisma migrate deploy    # apply migrations (production, run manually)
pnpm exec prisma studio            # visual database viewer
pnpm run seed                      # local test data + admin@eternaflor.local / local1234
pnpm run seed:demo                 # presentable demo catalogue; wipes the local database
```

### Frontend (from `eterna-flor-front/`)
```bash
pnpm install
pnpm dev     # next dev, port 3000
pnpm build   # next build
pnpm start   # next start
pnpm lint    # eslint
```

There is no `format` and no test runner in the frontend package; do not invent those commands.

## Notes
- **Run `pnpm run lint` before `pnpm run test`** in the backend; neither is chained to the other.
- **PostgreSQL, not MySQL.** `prisma/schema.prisma` uses `provider = "postgresql"` with `directUrl`; the local database is PostgreSQL and production runs on Neon.
- Backend uses `nodenext` module resolution — unusual for NestJS.
- Backend eslint uses `typescript-eslint` with type checking enabled (`projectService: true`); `@typescript-eslint/no-explicit-any` is off.
- `prisma` is a devDependency. `pnpm run build` runs `prisma generate` first, so a build without dev dependencies cannot work.
- pnpm 12 ignores the old `onlyBuiltDependencies` field silently. The setting that works is the `allowBuilds` map in `pnpm-workspace.yaml`; without it the install exits non-zero and Render marks the deploy failed.
- `DATABASE_URL` and `DIRECT_URL` live in `eterna-flor-back/.env`; the full contract is `eterna-flor-back/.env.example`. `JWT_SECRET` is mandatory — the API refuses to boot without it.
- `pnpm run seed` and the e2e tests refuse to run when `DATABASE_URL` does not point at `localhost`, `127.0.0.1` or `::1` (guard in `src/common/local-database.ts`). Both delete rows: never aim them at Neon.
- The seed only deletes rows named `[prueba] `, `Materia prima de prueba: ` and `Cliente de prueba `, so it is safe to repeat.
- `/health` must never query the database. It is a keep-alive probe for Render and querying would wake Neon and exhaust its monthly compute hours; the reason is documented in `src/health/health.controller.ts`.
- **Accented enums are a known trap.** In `schema.prisma` the member is `Pequeno` and the database label is `Pequeño` (`@map`); Prisma accepts and returns the member name, while the frontend sends the label. Same for `EstadoPedido` / `En preparación` with `EnPreparacion`. Translation happens in `src/common/enum-label.ts` and `src/ramos/dto/ramo.dto.ts`. Details in `docs/estado-del-proyecto.md`.

## Frontend conventions
- **Read `node_modules/next/dist/docs/` before writing code.** Next.js 16 differs from training data; heed deprecation notices.
- Tailwind CSS 4 with `@tailwindcss/postcss`; there is no `tailwind.config.js`. Tokens live in the `@theme` block of `app/globals.css`.
- Never write hex values in JSX; use the tokens (`bg-ink`, `text-ink-muted`, `bg-blossom`, …). The palette is `ink`, `petal`, `blossom`, `lilac`, `surface`, and their `-deep`/`-muted` variants.
- Reuse `components/ui/` (`Button`, `Card`, `Badge`, `Field`, `EmptyState`, `Spinner`, `Icon`) instead of inventing new markup for the same element.
- API access goes through `lib/api.ts`; formatting through `lib/format.ts`; size labels through `lib/tamanos.ts`.

## Where the truth lives
- `docs/estado-del-proyecto.md` — live state, environment variables, operations, known traps.
- `docs/architecture.md` — current architecture, module map, data model, retired decisions.
- `design/system.md` — implemented design tokens and components (`DESIGN.md` is the declared intent).
