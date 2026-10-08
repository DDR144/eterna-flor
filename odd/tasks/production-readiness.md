# Feature: production-readiness

**Rama:** `feat/production-readiness`
**Objetivo:** dejar EternaFlor desplegable en una arquitectura de costo cero (Vercel + Render Free + Neon PostgreSQL), cerrando antes los bloqueadores de datos y seguridad.
**Contexto:** proyecto de práctica personal. Restricción dura: costo mensual $0.

## Arquitectura objetivo

| Componente | Proveedor | Plan | Costo |
|---|---|---|---|
| Frontend (Next.js) | Vercel | Hobby (uso personal, no comercial) | $0 |
| Backend (NestJS) | Render | Free web service (spins down a los 15 min) | $0 |
| Base de datos | Neon | Free (PostgreSQL, 1 GB, permanente) | $0 |
| Imágenes | Cloudinary | Free | $0 |
| Dominio | subdominios `*.vercel.app` / `*.onrender.com` | — | $0 |

Decisiones derivadas de la aritmética de tiers gratuitos:

- El frontend **no** va en Render Free: 2 servicios × 744 h = 1488 h superan las 750 h/mes del workspace.
- `/health` **no** debe consultar la base de datos: mantener Neon activo 24/7 consumiría ~186 CU-horas frente a las 100 CU-horas del plan gratuito.
- El backend se mantiene despierto con un cron de GitHub Actions contra `/health` cada ~10 minutos.

## Criterios de aceptación de la fase 1

- El esquema de Prisma usa PostgreSQL y existe una migración inicial versionada en `prisma/migrations/`.
- `pnpm prisma migrate deploy` crea el esquema completo sobre una base vacía, sin intervención manual.
- El backend no arranca sin `JWT_SECRET` (no hay secreto por defecto).
- `POST /auth/register` solo funciona mientras no exista ningún usuario.
- Ninguna respuesta de la API expone `passwordHash`.
- `POST /auth/login` está limitado por rate limiting.
- `pnpm run build`, `pnpm exec eslint` (sin `--fix`) y `pnpm run test` sin errores nuevos respecto a la línea base.

## Tareas

| ID | Tarea | Estado | Evidencia | Commit |
|---|---|---|---|---|
| 1.1 | Cambiar Prisma a PostgreSQL con `directUrl` | pending | | |
| 1.2 | Crear base local `eternaflor` y generar la migración inicial | pending | | |
| 1.3 | Contrato de variables: `.env` local y `.env.example` actualizado | pending | | |
| 1.4 | `JWT_SECRET` obligatorio vía `getOrThrow` y expiración de tokens | pending | | |
| 1.5 | Cerrar `/auth/register` al primer administrador y dejar de exponer `passwordHash` | pending | | |
| 1.6 | Rate limiting en `/auth/login` | pending | | |
| 1.7 | Verificación de fase 1: build, lint, test y `migrate deploy` en base limpia | pending | | |

## Fases posteriores (fuera del alcance de esta fase)

| Fase | Alcance |
|---|---|
| 2 | `/health` sin tocar la BD, pin de Node (`engines` + `.node-version`), `pnpm install` sin exit 1, `prisma generate` en el build, CORS real, logging de producción, CI en GitHub Actions |
| 3 | DTOs reales en ramos, paginación, exception filter global, `publicId` de Cloudinary, lint del backend en verde |
| 4 | `middleware.ts` de sesión, `error/loading/not-found`, SEO del catálogo, ISR (`revalidate`), `next/image`, `Intl` PEN, lint del frontend en verde |
| 5 | Despliegue real: cuentas en Neon, Render y Vercel; variables; migración a Neon; cron de keep-alive; prueba end-to-end |
| 6 | Runbook en `docs/`, y alineación del PRD, `AGENTS.md` y `docs/architecture/` con la infraestructura real |

## Desviaciones documentales conocidas (se corrigen en la fase 6)

- `PRD_EternaFlor.md` y `docs/architecture/*` describen MySQL; se migra a PostgreSQL.
- `docs/architecture/infrastructure.md:16` afirma que `prisma migrate deploy` corre en el arranque del backend; no es así.
- `docs/architecture/security.md` afirma que existe `ThrottlerModule`; se implementa en la tarea 1.6.
- `AGENTS.md:15,25` indica `cd eternally-flor-back`, carpeta que no existe.
