# Feature: publication-ready

**Rama:** `chore/publication-ready`
**Objetivo:** dejar el repositorio en condiciones de publicarse en GitHub como pieza de portafolio: sin secretos, sin material ajeno rastreado, con licencia, con integración continua y con el producto visible en el README.
**Contexto:** el repositorio es privado y el usuario quiere usarlo en su CV. Una auditoría de solo lectura (2026-11-09) encontró el historial limpio de secretos, pero 230 de los 397 archivos rastreados son skills de agentes vendoreadas dentro de cada paquete, no hay `LICENSE` ni CI, y el README no muestra el producto.

## Specs

S1. Autorización del usuario, textual: "Preparar el repositorio y publicarlo". Descripción de la opción aceptada, textual: "Rama aparte: gitleaks, sacar las 230 skills vendoreadas, LICENSE, CI, README con capturas. Tú decides publicar al final."

S2. `gitleaks` se ejecuta sobre **todo** el historial del repositorio y termina sin hallazgos; el resultado se registra como evidencia con el comando exacto y el conteo de leaks.

S3. Ninguna skill de agente vendoreada queda rastreada: `eterna-flor-back/.agents/` y `eterna-flor-front/.agents/` dejan de aparecer en `git ls-files`, y un `git status` posterior no las vuelve a proponer como cambios sin seguimiento.

S4. Existe un `LICENSE` en la raíz del repositorio, con un titular y un año, coherente con lo que el README afirma sobre su uso.

S5. Existe un workflow de GitHub Actions que corre en cada push y pull request: backend `pnpm run lint` + `pnpm run test` y frontend `pnpm lint` + `pnpm build`. El YAML es válido y los mismos comandos pasan en local con el Node que fija `.node-version`.

S6. El `README.md` muestra el producto con al menos una captura real de la aplicación en producción y advierte del arranque en frío de Render y de su causa, de modo que quien lo lea no interprete el minuto de espera como un servicio caído.

S7. Los identificadores operativos prescindibles dejan de publicarse en la documentación: el identificador del proyecto de Neon y el cloud name de Cloudinary se sustituyen por descripciones, y ninguna instrucción se vuelve irrealizable por el cambio.

S8. La visibilidad del repositorio en GitHub la decide el usuario: el agente no ejecuta `gh repo edit --visibility` ni ningún equivalente, y entrega el comando exacto para cuando lo decida.

## Tasks

- T1 — Verificar secretos con gitleaks sobre todo el historial (S2) — `f9f6c6a`
- T2 — Desrastrear las skills vendoreadas de los dos paquetes (S3) — `25ac940`
- T3 — Añadir LICENSE (S4) — `3337334`
- T4 — Añadir integración continua (S5) — `f4db74f`
- T5 — Capturas reales y README (S6) — `ee3ca6f`
- T6 — Redactar identificadores operativos en la documentación (S7) — `0e19229`
- T7 — Corregir el lint del frontend que la verificación descubrió (S5) — `449d7f7`
- T8 — Verificación final y entrega de la decisión de visibilidad (S1, S8) — rama `chore/publication-ready`

## Log

L1 — Pedido del usuario, textual: "actualmente creo que este proyecto es el más fuerte que tengo pero es de código privado, es decir, el repositorio es privado, no sé si debería hacerlo público para colocarlo en mi cv o si dejarlo privado, quiero saber que implica esta decision y que me recomendarias tu"

L2 — El usuario pidió repetir las opciones y eligió la primera, textual: "Preparar el repositorio y publicarlo (value: preparar)".

L3 — Evidencia recogida antes de escribir: `git rev-list --count HEAD` = 59 commits, 397 archivos, 4 MB de `.git`, rama `main` en sincronía con `origin/main`, árbol de trabajo limpio. `git log --all --diff-filter=A --name-only` filtrado por nombres de entorno: el único archivo de entorno jamás rastreado es `eterna-flor-back/.env.example`, con placeholders `your-neon-user:your-neon-password`. `prisma/seed.ts:11-18` usa prefijos `[prueba] `, `Materia prima de prueba: `, `Cliente de prueba ` y teléfonos `999…`; ningún dato real. `git ls-files | grep -c '\.agents/skills'` = 230, repartidos 99 en `eterna-flor-back` y 131 en `eterna-flor-front`. Sin `LICENSE`, sin `.github/workflows`. Herramientas: `gh` 2.103.3 presente, `gitleaks` ausente, `chromium` presente en `/usr/bin/chromium`.

L4 — Verificación de secretos (S2): `gitleaks` 8.30.1 sobre `--log-opts="--all"` (66 commits, 2.24 MB) encontró **1** hallazgo: `generic-api-key` en `eterna-flor-back/README.md` del commit `fc386956`, el token de badge `abc123def456` que el README del starter de NestJS publica como placeholder y que ya no está en el árbol. Se añadió `.gitleaks.toml` con allowlist por **valor exacto**, no por regla ni por ruta, que silenciaría hallazgos futuros reales en el mismo archivo. Re-ejecución: 0 leaks.

L5 — Ampliación de S3 decidida por el agente y sujeta a revisión: además de las 230 skills se desrastrearon `eterna-flor-back/skills-lock.json`, `eterna-flor-front/skills-lock.json` y `.gga` (configuración local del hook de revisión, sin claves). El `.gitignore` raíz ya declaraba ignorados los lockfiles; `.gga` se añadió ahí. `git rm --cached` no borra del disco. Archivos rastreados: 397 → 164. Verificado que ni el código ni los `package.json` importan nada desde `.agents/`.

L6 — Desviación documentada de S5: CI ejecuta `pnpm exec eslint` **sin** `--fix` en el backend, porque el script `lint` del paquete pasa `--fix` y repararía el árbol en lugar de reportar, aun saliendo 0. Las versiones salen de lo ya fijado: Node 24 (`.node-version`) y pnpm 12.9.1 (`packageManager`).

L7 — Defecto encontrado por la verificación, no por el diseño: `pnpm lint` del frontend fallaba con **15 errores** (14 `@typescript-eslint/no-explicit-any` en `lib/api.ts`, 1 `react-hooks` por invocar `checkAuth` antes de su declaración en `lib/auth-context.tsx`). El job de CI recién añadido se habría caído en el primer push. Corregido en el código, no silenciado. Tres intentos, cada uno con su build: `<any>` → `<unknown>` en las respuestas que ninguna pantalla consume y `RamoPayload` para el cuerpo de ramos; `pedidos.getAll` necesitó su tipo real porque `app/admin/pedidos/page.tsx:178` sí consume el resultado y el build lo destapó; mover `checkAuth` cambió de regla en vez de resolverla (`react-hooks/set-state-in-effect`), así que la comprobación inicial quedó como cadena de promesas dentro del efecto con indicador de cancelación, que además evita escribir sobre un proveedor desmontado. Quedan 3 avisos `<img>`: el catálogo sirve URL de Cloudinary y `next/image` se factura por imagen.


L8 — Capturas (S6): la API tardó 52 s en despertar del plan Free, lo que confirma la advertencia del README. El catálogo de producción muestra **un solo ramo, `ramo one`, a S/14.00**: parece un registro de prueba. Se capturaron catálogo móvil, catálogo de escritorio y pantalla de acceso contra la web desplegada. El panel no se capturó porque exige credenciales y datos reales; montar el stack local con semilla habría producido capturas etiquetadas `[prueba]`, igual de poco presentables. Queda como decisión del usuario.

L9 — Redacción (S7): se sustituyeron el identificador del proyecto de Neon, el de su rama y el cloud name de Cloudinary en `docs/architecture.md`, `docs/estado-del-proyecto.md` y `odd/tasks/production-readiness.md`. Se corrigió además una afirmación falsa en `docs/estado-del-proyecto.md:3`, que decía que la rama de documentación no estaba fusionada cuando `git branch --merged main` la lista. Límite reconocido: el cloud name sigue siendo visible en las URL de imagen que sirve Cloudinary, así que la redacción es higiene documental, no una medida de seguridad.

L10 — Visibilidad (S8): el agente **no** ejecutó `gh repo edit` ni equivalente. La decisión y el comando quedan en manos del usuario.

L11 — Verificación (S5, S2): backend `pnpm exec eslint "{src,apps,libs,test,prisma}/**/*.ts"` → exit 0 sin salida; `pnpm run test` → 8 suites, 51 tests, exit 0. Frontend `pnpm lint` → exit 0, 0 errores y 3 avisos; `pnpm build` → compila y genera `BUILD_ID`. `gitleaks` con `.gitleaks.toml` sobre 72 commits → 0 leaks. Workflow validado como YAML: tres jobs (`secrets`, `backend`, `frontend`) y `on` con `push` a `main` y `pull_request`. **Verificado en GitHub**, no solo en local: el run del PR #1 terminó con `Secret scan: success`, `Backend lint and tests: success`, `Frontend lint and build: success`.

L12 — Frontera de rebanada: 8 commits y ~30 líneas de contenido propio más eliminaciones (40.524 líneas eliminadas, casi todas de skills de terceros); 244 archivos tocados, de los que tres son imágenes. `Risk: none` con una salvedad: `lib/api.ts` es código compartido por todas las pantallas, pero el cambio es de tipos y de orden de declaración, sin cambio de comportamiento, y lo cubre el type check del build.

L13 — Revisión nativa (RDD activo): `review.start` se detuvo en preflight con `lens_context_budget_exceeded`. No se creó autoridad (`mutation_performed: false`), así que no hay nada que abandonar ni reparar. Causa: el candidato entero de la rama incluye los 233 archivos eliminados de skills, y esa evidencia excede el presupuesto de contexto del revisor. El propio proveedor marca el reintento del mismo candidato como incapaz de prosperar y ofrece la continuación: revisar candidatos más pequeños, cada uno por debajo del presupuesto. Queda como decisión del usuario: empaquetar el único commit con código (`449d7f7`) como candidato propio, o dejar el cambio sin revisión nativa.
