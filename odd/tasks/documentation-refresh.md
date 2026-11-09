# Feature: documentation-refresh

**Rama:** `docs/refresh-documentation`
**Objetivo:** dejar la documentación del proyecto alineada con lo que el repositorio y la producción son hoy: Neon PostgreSQL + Render Free + Vercel + Cloudinary, Next.js 16 con el sistema visual "Pastel Candy", y los scripts que realmente existen.
**Contexto:** una auditoría de solo lectura (2026-11-09) encontró 40+ afirmaciones falsas. La más grave: `docs/architecture/` (15 archivos + 6 ADRs) describe una arquitectura MySQL en Railway que nunca se desplegó, y `security.md` invierte el contrato de autenticación (dice cookie httpOnly exclusiva; el código guarda el token en `localStorage` y lo envía como `Bearer`).

## Specs

S1. Existe un `README.md` en la raíz del repositorio que dice qué es EternaFlor, las URLs vivas de producción, el layout de los dos paquetes y cómo arrancar cada uno. Hoy no existe ningún README raíz.

S2. `AGENTS.md` no afirma nada falso: dice PostgreSQL (no MySQL), usa las rutas `eterna-flor-back` y `eterna-flor-front` (hoy dice `eternally-flor-back`), y solo documenta scripts que existen en los `package.json` (el frontend no tiene `format` ni `test`).

S3. `docs/architecture/` — los 13 archivos y la carpeta `adr/` — se sustituye por un único `docs/architecture.md` que describe lo que existe hoy: frontend en Vercel, API NestJS en Render Free, PostgreSQL en Neon, imágenes en Cloudinary, los 7 módulos del backend y el contrato real de autenticación. Incluye una sección de decisiones retiradas que nombra las afirmaciones falsas (MySQL, Railway, TypeORM, cookie exclusiva, migraciones en el arranque) en lugar de borrarlas en silencio.

S4. Los `README.md` de `eterna-flor-back/` y `eterna-flor-front/` dejan de ser el boilerplate del generador (starter de NestJS con despliegue en Mau/AWS; create-next-app con la fuente Geist) y describen el paquete real.

S5. `docs/estado-del-proyecto.md` no enumera como pendiente nada ya resuelto ni describe como aparcada una rama ya fusionada: el `.gitignore` ya cubre `.agents/` y `.claude/`, y el trabajo de `feat/ui-design-system` está en `main` vía `feat/ui-refresh`.

S6. `DESIGN.md` y `design/system.md` coinciden con los tokens de `eterna-flor-front/app/globals.css`: `ink/petal/blossom/lilac`, radios `tight/soft/lush`, sin tokens de espaciado, y los valores hex vigentes.

S7. `docs/guia-rapida.md` usa las URLs reales (`eterna-flor.vercel.app`) en lugar de `https://tu-dominio.com`.

S8. Ningún enlace relativo de los documentos que quedan apunta a un archivo que no existe, y ninguna afirmación de stack sobrevive como falsa (verificado con búsqueda sobre el árbol).

## Tasks

- T1 — `README.md` raíz (S1) — `0a4d42a`
- T2 — `AGENTS.md` + `eterna-flor-front/AGENTS.md` (S2) — `0a4d42a`
- T3 — `docs/architecture.md` único y borrado del árbol viejo (S3) — `0a4d42a`
- T4 — READMEs de los dos paquetes (S4) — `39f92b4`
- T5 — `docs/estado-del-proyecto.md` (S5) — `d416da9`
- T6 — `DESIGN.md` + `design/system.md` (S6) — `d416da9`
- T7 — `docs/guia-rapida.md` (S7) — `d416da9`
- T8 — Verificación de enlaces y de afirmaciones (S8) — rama `docs/refresh-documentation`

## Log

L1 — Pedido del usuario, textual: "actualicemos el tema de documentacion del proyecto, me parece que me comentaste que tenia erroes y estaba desactualizada"

L2 — Decisión del usuario sobre `docs/architecture/`: "Primero el inventario, luego decido". Se presentó el inventario de la auditoría.

L3 — Decisión del usuario, textual: "Ejecuta la opción 2 (recomendada)": README raíz nuevo, `AGENTS.md` reescrito, `estado-del-proyecto` refrescado, un solo `docs/architecture.md`, READMEs reales, `DESIGN.md` alineado.

L4 — Evidencia recogida antes de escribir (no supuestos): `prisma/schema.prisma:5-8` = `provider = "postgresql"` + `directUrl`; `eterna-flor-back/package.json` scripts `build/format/lint/test/test:e2e/seed/start/start:dev/start:debug/start:prod`; `eterna-flor-front/package.json` solo `dev/build/start/lint`; `lib/api.ts:16-41` token en `localStorage` + `Authorization: Bearer`; `auth.module.ts:18` `expiresIn: '7d'`; `main.ts:9-12` `app.enableCors()` con `FRONTEND_URL`; `health.controller.ts` documenta el cron de ~10 min y prohíbe consultar la base; `reportes.controller.ts:26` exporta CSV (no ZIP); `pedidos.service.ts:76-157` descuenta y restaura stock de ramos (no de materias primas); `app/globals.css` tokens `petal #fbe4ee`, `petal-deep #ecc0d5`, `line #dfbccf`, `line-strong #c99ab4`; `app/layout.tsx` Fraunces + Nunito.

L5 — Verificación (S8) sobre el árbol final: búsqueda de `MySQL|Railway|TypeORM|tu-dominio|eternally-flor|create-next-app|Geist|on-primary|CorsModule|UploadModule` en todos los `.md` fuera de `node_modules`; solo quedan las menciones históricas de `odd/tasks/`, las del README de AGENTS.md que niega MySQL, la fila del log de commits y el texto de "legacy classes" de `design/system.md` que describe el sistema anterior. Comprobador de enlaces relativos sobre todos los `.md`: cero enlaces rotos. Las afirmaciones de la guía de uso se contrastaron contra el código: filtro por tamaño en `app/catalogo/page.tsx:14-16`, botón de WhatsApp en `:31-33`, alertas de stock en `app/admin/ramos/page.tsx:498-502` y `app/admin/materias-primas/page.tsx:353`, selector de estado en línea en `app/admin/pedidos/page.tsx:384-457`, y borrado restringido a `Pendiente`/`EnPreparacion` en `pedidos.service.ts:147-148`. `PRD_EternaFlor.md` no requirió cambios: no menciona stack.

L6 — Frontera de rebanada: 4 commits y ~1773 líneas autoradas (577 inserciones, 1196 eliminaciones), casi todas eliminaciones de la documentación falsa. Cambio exclusivamente documental: 32 archivos, ninguno con código de aplicación, así que no aplica verificación funcional ni revisión nativa de código. `Risk: none`.
