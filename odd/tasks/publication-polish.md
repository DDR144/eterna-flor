# Feature: publication-polish

**Rama:** `chore/publication-polish`
**Objetivo:** cerrar los tres pendientes que la auditoría de publicación del 2026-11-20 dejó abiertos: sacar los datos de prueba del catálogo que el README muestra, sacar del repositorio el WhatsApp real de un tercero y arreglar la presentación del repositorio.
**Contexto:** `main` ya estaba técnicamente limpio (CI en verde, `gitleaks` sin hallazgos sobre toda la historia, MIT, `.env` nunca rastreado), así que esta slice es de contenido, no de seguridad. Publicar la visibilidad sigue siendo decisión del usuario.

## Specs

S1. Autorización, textual: el usuario preguntó "el repo esta listo para ser publico?" y respondió "si" a «¿Quiero que prepare los tres puntos en una sola rama?».

S2. El catálogo que muestran el README y sus capturas no puede ser el registro de prueba de producción. Opción aceptada, textual: "Captura desde local con datos sembrados". Las capturas se toman de una compilación de producción local contra una base local sembrada; el registro `ramo one` a S/14.00 deja de ser la imagen del producto.

S3. El número de WhatsApp del negocio no queda en el repositorio. Opción aceptada, textual: "Reemplazarlo por un número de ejemplo". Después del cambio, el número real de nueve dígitos no aparece en ningún archivo rastreado, ni en el código, ni en los mockups, ni en las capturas.

S4. Presentación del repositorio: descripción y topics en GitHub, y el PRD deja de afirmar que el producto es para un "negocio familiar", premisa que el usuario ya había corregido.

## Tasks

- T1 — Auditoría de publicación de solo lectura: secretos en historia, cadena de conexión, superficie pública de la API, claves del seed (S1) — sin cambios de código
- T2 — Sembrador de datos de demostración `pnpm run seed:demo` (S2) — `f93885e`
- T3 — Número de WhatsApp de ejemplo en el catálogo y en los mockups (S3) — `b86ce00`
- T4 — Capturas nuevas desde compilación de producción local y README (S2) — `829beb7`
- T5 — PRD sin la premisa de negocio familiar (S4) — `36164e6`
- T6 — Descripción y topics del repositorio en GitHub (S4) — `gh repo edit`, fuera del árbol de git
- T7 — Este documento

## Log

L1 — Pedido del usuario, textual: "el repo esta listo para ser publico?"

L2 — El agente propuso tres pendientes en una rama y el usuario aceptó, textual: "si".

L3 — Cuestionario de la slice, respuestas elegidas textuales: "Reemplazarlo por un número de ejemplo" (WhatsApp) y "Captura desde local con datos sembrados" (catálogo).

L4 — Evidencia de la auditoría (2026-11-20, sobre `main` en `5b41854`): `gitleaks git --log-opts="--all"` corre en CI y pasa; el único archivo sensible jamás añadido es `.env.example` con marcadores; todas las cadenas de conexión de la historia son plantillas; `.env` local está ignorado y nunca fue rastreado. Superficie pública de la API: `/catalogo`, `/health`, `/auth/login` (throttle 5/min), `/auth/logout` y `/auth/register`, que responde 403 en cuanto existe un usuario. `POST /auth/login` con `admin@eternaflor.local`/`local1234` contra producción devuelve 401: la credencial documentada del seed no abre nada real.

L5 — El id de proyecto de Neon y el cloud name de Cloudinary siguen en commits anteriores aunque la documentación los redacte. No son credenciales y no se reescribió la historia: hacerlo invalidaría la evidencia del escaneo de CI y los hashes. Se registra como higiene pendiente, no como bloqueo.

L6 — Entorno de la captura: esta máquina solo tiene el cliente de PostgreSQL, el servicio no arranca sin `sudo` y el contenedor `postgres18` del usuario no expone credenciales usables desde el host. Se levantó un contenedor propio (`eternaflor-demo-db`, puerto 55432) y se borró la base `eternaflor_demo` que se había creado de más en el contenedor del usuario.

L7 — Verificación de la slice: `pnpm exec eslint "src/**/*.ts" "prisma/**/*.ts" "test/**/*.ts"` → exit 0; `pnpm run test` → 51/51 en 8 suites; `pnpm lint` y `pnpm build` del frontend → 0 errores (3 avisos preexistentes de `no-img-element`); capturas a 1440x1500, 430x1400 y 1440x900, las mismas medidas que las anteriores, tomadas del build de producción para que no aparezca el indicador de desarrollo de Next.

L8 — Consecuencia declarada de T3: al fusionar esta rama, el despliegue automático de Vercel publica el número de ejemplo y el botón real de WhatsApp del catálogo deja de funcionar hasta que se configure el número del negocio. Es exactamente lo que el usuario decidió, y la fusión y el despliegue siguen siendo decisiones suyas.
