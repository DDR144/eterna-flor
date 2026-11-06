# Estado del proyecto y traspaso

**Última actualización:** 2026-11-06 · rama `main` · commit `2de60f1`

Este documento existe para que una sesión nueva pueda continuar sin reconstruir el contexto. Si algo de aquí no coincide con el repositorio, **manda el repositorio**: `git log --oneline -10 main`.

---

## 1. Qué está vivo

| Componente | Dirección | Dónde |
|---|---|---|
| Web (catálogo + panel) | `https://eterna-flor.vercel.app` | Vercel, plan Hobby |
| API (backend) | `https://eternaflor-api.onrender.com` | Render, web service Free |
| Base de datos | proyecto `icy-cell-68397091`, región `aws-us-east-2` (Ohio) | Neon, plan Free |
| Fotos | cloud name `qpzvx7c8` | Cloudinary, plan Free |
| Dominio | subdominios gratuitos | — |

**Ojo con la dirección:** la correcta lleva guion, `eterna-flor.vercel.app`. `eternaflor.vercel.app` (sin guion) es de otra persona, un sitio brasileño de flores artesanales.

## 2. Límites de los planes gratuitos y las decisiones que imponen

- **El frontend no va en Render.** Render Free da 750 horas de servicio al mes por workspace y un mes tiene 744. Dos servicios encendidos serían 1488 horas y ambos se suspenderían a mitad de mes.
- **`/health` no consulta la base de datos, a propósito.** El backend se mantiene despierto con un ping externo cada 5 minutos. Si ese ping tocara la base, Neon quedaría activo 24/7 (~186 CU-horas frente a las 100 del plan) y la base dejaría de responder a mitad de mes. Está comentado en el código: no "mejorar" añadiendo una comprobación de base.
- **El servicio duerme a los 15 minutos sin tráfico.** La primera visita después tarda cerca de un minuto. Se compensa con un monitor externo; todavía **no** está configurado.

## 3. Variables de entorno

Viven en el panel de Render, nunca en el repositorio. El contrato completo está en `eterna-flor-back/.env.example`.

| Variable | Para qué | Trampa |
|---|---|---|
| `DATABASE_URL` | cadena **pooled** de Neon, en runtime | debe llevar `sslmode=require` |
| `DIRECT_URL` | cadena **directa** (sin `-pooler`) | solo la usan las migraciones; **Render no la necesita**, verificado |
| `JWT_SECRET` | firma de tokens | obligatorio: el backend no arranca sin él |
| `FRONTEND_URL` | CORS | debe ser el origen exacto, **sin barra final** |
| `CLOUDINARY_*` | subida de fotos | sin ellas el backend arranca, pero subir foto da 500 |
| `NODE_ENV` | `production` | — |
| `PORT` | **no definir** | Render la inyecta; fijarla a mano rompe el health check |

## 4. Operación

- **Desplegar:** `git push origin main`. Render y Vercel redespliegan solos. Verificado en vivo dos veces.
- **Aplicar una migración a producción:** una sola vez, desde local, con las variables en línea para no dejar credenciales en el `.env`:
  `DIRECT_URL="<directa>" DATABASE_URL="<pooled>" pnpm exec prisma migrate deploy`
- **Comprobar que un despliegue llegó:** `/health` devuelve `uptime`, que crece de forma monótona. Un salto hacia atrás es un proceso nuevo. Si el build falla, Render sigue sirviendo el anterior sin reiniciar.
- **Cambiar variables en Render:** "Save only" **no las aplica**. Hace falta "Save, rebuild, and deploy"; un reinicio reutiliza la configuración del despliegue anterior.
- **Revertir:** volver a desplegar el commit anterior desde Render. Todas las unidades publicadas hasta ahora son reversibles: ninguna toca el esquema.

## 5. Lo ya hecho

| Commit | Qué |
|---|---|
| `1c9d84a` | Prisma pasa de MySQL a PostgreSQL, con `directUrl` y la migración inicial |
| `28ae998` | Auth endurecida: `JWT_SECRET` obligatorio, registro cerrado al primer usuario, sin fuga de `passwordHash`, rate limiting |
| `b9721c7` | `/health` sin base, pin de Node y pnpm, `pnpm install` en 0, `prisma generate` en el build |
| `1a9019c` + `11c97be` | DTOs validados en ramos, filtro de excepciones de Prisma, compatibilidad con el panel desplegado |
| `067d7cd` | Lint de 22 errores/51 warnings a **0/0**, y carrera del registro cerrada con transacción serializable |
| `cc24c88` | El filtro por tamaño del catálogo aplica las etiquetas acentuadas que envía la página |
| `b95faf4` | Documento de estado y traspaso (este archivo) |
| `9b8867f` | Seed de datos locales (`pnpm run seed`) y guard de base movido a `src/common/local-database.ts` |
| `06d6d69` | La API acepta la etiqueta de estado que guarda la base (`En preparación`), con `src/common/enum-label.ts` |
| `57063de` | La web pinta las etiquetas acentuadas: `lib/tamanos.ts` en el catálogo y el admin de ramos |

Verificado en producción el 2026-11-05: `GET /catalogo?tamano=Pequeño` y `?tamano=Pequeno` devuelven ambos el ramo, y el texto visible junto a la tarjeta dice **Pequeño**. La API sigue devolviendo el nombre de miembro (`Pequeno`) en el JSON; la traducción a etiqueta ocurre en el frontend, a propósito.

Además, de otras sesiones: **seed de datos locales** (`pnpm run seed`, usuario `admin@eternaflor.local` / `local1234`) y **Cloudinary configurado y verificado**.

## 6. Pendientes reales

| Pendiente | Depende de |
|---|---|
| Limpiar el ramo de prueba `ramo one` (id 1) de la base de producción: aparece en el catálogo público | Usuario |
| Monitor externo (UptimeRobot, cada 5 min a `/health`) | Usuario, 5 minutos |
| `.agents/`, `.claude/` y `skills-lock.json` están sin trackear en la raíz y ensucian el estado del repo | Cualquiera. Dos líneas en `.gitignore` |
| Alinear la documentación vieja: `AGENTS.md` y `docs/architecture/*` describen una infraestructura que no existe | Nadie |
| Paginación | **Recomendación: no hacerla.** Una sola usuaria, pocos datos, y cambiaría el contrato de una API en vivo |

**Aparcado por decisión (2026-11-06):** `feat/ui-design-system` — 5 commits, +1035/−363 en 13 archivos, **existe solo en local, no está en `origin`**. No se fusiona y no se borra: queda como referencia congelada. El trabajo de frontend sigue desde `main` sin esperar a esa rama, y si algún día se retoma, se revisa entonces. Nota: el repo arrastra además cuatro ramas locales ya contenidas en `main` (`feat/api-hardening`, `feat/api-validation`, `feat/api-validation-entangled`, `feat/production-readiness`); no se tocaron.

Resuelto desde la primera versión de este documento: los valores de enum ya se muestran con acento (`57063de`), `GET /pedidos?estado=En preparación` ya se acepta (`06d6d69`), Cloudinary está configurado, y el prefijo de limpieza del e2e pasó de `'Ramo '` a `'[e2e] Ramo '`, así que ya no borra ramos hechos a mano.

## 7. Trampas conocidas

- **Enums con acento.** En `schema.prisma` el miembro es `Pequeno` y la etiqueta de la base es `Pequeño` (`@map`). Prisma acepta y devuelve **el nombre del miembro**. El frontend envía la etiqueta. Esto ya causó dos bugs (crear un ramo de tamaño Pequeño daba 500, y el filtro del catálogo se ignoraba) y sigue afectando a lo que se **muestra**. Misma trampa en `EstadoPedido` con `En preparación` / `EnPreparacion`.
- **pnpm 12 y los build scripts.** `onlyBuiltDependencies` está silenciosamente muerto: se ignora sin error ni aviso. El ajuste que funciona es el mapa `allowBuilds` en `pnpm-workspace.yaml`. Sin él, `pnpm install` sale con código 1 y Render marca el deploy como fallido.
- **El `.env` local enmascara variables faltantes.** El cliente de Prisma carga el `.env` del proyecto al importarse, así que un proceso arrancado en otro directorio igual encuentra las variables. En producción no hay `.env`, por eso `getOrThrow` sí aborta allí.
- **Los tests e2e solo pueden tocar bases locales**, por `src/common/local-database.ts`. No es un estorbo: la base de producción es remota y una limpieza descuidada la borraría.
- **`prisma` es devDependency.** Si una plataforma instalara sin dependencias de desarrollo, `prisma generate` fallaría. Render las instala durante el build.

## 8. Coordinación entre sesiones

Aquí se han pisado dos sesiones de Pi trabajando en la **misma carpeta**. Consecuencia real: un commit quedó montado sobre la rama equivocada y hubo que separarlo.

- Un repositorio tiene **una sola** carpeta de trabajo, un solo índice y un solo puntero de rama. Dos sesiones en la misma carpeta los comparten.
- **Una sesión por carpeta**, o un `git worktree` por sesión:
  `git worktree add ../eterna-flor-ui feat/ui-design-system`
- Antes de commitear, **comprobar en qué rama se está** con `git branch --show-current`. Ese descuido es exactamente lo que pasó.
- Antes de recomendar cualquier cosa, **comprobar el estado real** (`git log`, `git fetch`) y buscar en memoria: puede que otra sesión ya lo haya hecho.
