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
| 1.1 | Cambiar Prisma a PostgreSQL con `directUrl` | done | `datasource` con `provider = "postgresql"` y `directUrl = env("DIRECT_URL")` | `1c9d84a` |
| 1.2 | Crear base local `eternaflor` y generar la migración inicial | done | `prisma/migrations/20261008084444_init`; `migrate reset --force` + `migrate deploy` recrean las 6 tablas, 2 enums y el `UNIQUE (ramo_id, materia_prima_id)` | `1c9d84a` |
| 1.3 | Contrato de variables: `.env` local y `.env.example` actualizado | done | `.env` local con `JWT_SECRET` de `openssl rand -base64 48`, ignorado por `git check-ignore`; `.env.example` documenta 9 variables | `1c9d84a` |
| 1.4 | `JWT_SECRET` obligatorio vía `getOrThrow` y expiración de tokens | done | `getOrThrow` en `jwt.strategy.ts` y `auth.module.ts`; fallback eliminado; `expiresIn: '7d'` | `28ae998` |
| 1.5 | Cerrar `/auth/register` al primer administrador y dejar de exponer `passwordHash` | done | Primer `POST /auth/register` → 201, segundo → 403; respuesta `{id,email,createdAt}`; login `{user:{id,email},token}` | `28ae998` |
| 1.6 | Rate limiting en `/auth/login` | done | `@nestjs/throttler` 6.7.1; 6 logins → `401 401 401 401 401 429`; `GET /` no limitado | `28ae998` |
| 1.7 | Verificación de fase 1: build, lint, test y `migrate deploy` en base limpia | done | 30/30 unit, 2/2 e2e, build exit 0, lint 22 errores / 51 warnings (idéntico a la línea base, sin errores nuevos) | — |

### Hallazgos de la fase 1

- **El `.env` local puede enmascarar variables faltantes.** El cliente de Prisma carga el `.env` del proyecto al importarse, así que un proceso arrancado desde otro directorio igual encuentra `JWT_SECRET`. En producción no existe `.env` (está ignorado por git), por lo que `getOrThrow` sí aborta el arranque. La prueba de "falla sin `JWT_SECRET`" no se puede hacer en local mientras exista ese archivo.
- **La aserción de `GET /` en `test/app.e2e-spec.ts` estaba obsoleta antes de esta fase.** `src/app.service.ts` devuelve una cadena más larga que la esperada; se corrigió la aserción, no el comportamiento.
- **`.codegraph/` está sin trackear** en la raíz del repositorio (índice de herramientas). Debe ignorarse en la tarea 2 de higiene.
- **`@nestjs/throttler` es en memoria**, así que el límite se reinicia al reiniciar el proceso. Suficiente para una instancia única.

### Pendientes abiertos de la fase 1

Ninguno. `eterna-flor-back/.env.example` quedó corregido: las cadenas de ejemplo usan el formato real de Neon (host con y sin sufijo `-pooler`, base de datos como segmento de ruta propio) e incluyen `sslmode=require` en ambas. La barrera de seguridad sobre rutas `.env*` se resolvió con autorización explícita del usuario y el alcance se limitó a ese único archivo.

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

---

## Fase 2a — Prerequisitos del despliegue (completada)

| ID | Tarea | Evidencia | Commit |
|---|---|---|---|
| 2a.1 | `GET /health` sin tocar la base de datos | Con PostgreSQL detenido: `health.e2e-spec` pasa y `app.e2e-spec` / `auth.e2e-spec` fallan con `PrismaClientInitializationError` | `b9721c7` |
| 2a.2 | Pin de runtime en ambos paquetes | `engines.node: "24.x"`, `packageManager: "pnpm@12.9.1"`, `.node-version: 24` | `b9721c7` |
| 2a.3 | `pnpm install` termina con código 0 | Reproducción en copia limpia bajo `/tmp`: sin `allowBuilds` → exit 1; con la configuración → exit 0 | `b9721c7` |
| 2a.4 | `prisma generate` dentro del build | `"build": "prisma generate && nest build"` | `b9721c7` |
| 2a.5 | Ignorar el índice local `.codegraph/` | entrada en `.gitignore` | `b9721c7` |

Estado tras esta fase: 30/30 tests unitarios, 3/3 e2e, build correcto en ambos paquetes, lint 22 errores / 51 warnings (línea base intacta).

### Hallazgos de la fase 2a

- **`onlyBuiltDependencies` está silenciosamente muerto en pnpm 12.9.1.** No produce error ni aviso de deprecación: simplemente se ignora. El ajuste que funciona es el mapa `allowBuilds` de `pnpm-workspace.yaml`. El archivo corrupto del backend ya intentaba usar ese nombre con claves basura de un solo carácter, que es la causa raíz del fallo de instalación.
- **La independencia de la base de datos quedó probada, no argumentada.** Deteniendo el contenedor `postgres18`, el test de `/health` pasa mientras los otros dos fallan al no poder conectar.
- **Riesgo a vigilar en el despliegue real:** `prisma` es una devDependency. Si la plataforma instala sin dependencias de desarrollo, `prisma generate` no encontrará el CLI y el build fallará. Render instala devDependencies durante el build por defecto; hay que confirmarlo en el primer despliegue.
- **Riesgo a vigilar:** si la plataforma no respeta `packageManager: pnpm@12.9.1` y usa otro pnpm mayor, `allowBuilds` desaparece y el install vuelve a fallar. Solo verificable en el despliegue real.
- **`sharp` quedó inservible en la instalación local** tras un build desde fuente fallido, aunque el binario precompilado `@img/sharp-linux-x64` está presente. No afecta a Vercel, que provee su propio runtime, pero romperá la optimización de imágenes en pruebas locales si algún día se auto-aloja el frontend.
- **Los lockfiles solo ganaron metadatos** (`lockfileVersion`, `packageManagerDependencies`); ninguna versión de dependencia de la aplicación cambió.
