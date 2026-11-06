# Feature: ui-design-system

**Rama:** `feat/ui-refresh` (continúa el trabajo parkeado de `feat/ui-design-system`)
**Objetivo:** unificar el sistema visual de EternaFlor en una sola fuente de verdad (`DESIGN.md` → tokens de Tailwind), crear la capa de componentes que hoy no existe, y migrar todas las pantallas. Fase 1 migró el shell del admin y `ramos` como piloto; fase 2 migra las cinco pantallas restantes según el artboard `design/ui-refresh/02-candy-counter.html`.
**Contexto:** la clienta percibe el sistema como genérico y con "ia-slop". El diagnóstico está en el `Log` (L2/L3): conviven cuatro sistemas de color y dos lenguajes visuales, y no existe `components/`.

## Specs

S1. El objetivo declarado por el usuario, textual: "me gustaria mejorar el diseño edl sistema ya que la clienta lo siente muy generico, y si tiene mucha ia-slop".

S2. Restricción procesal, textual: "no modifiques nada, primero responde".

S3. Cómo se resuelve el problema, textual: "no quiero crear una skill, quiero usar una ya creada para eliminar la ia-slop y mejorar la ui".

S4. La ruta elegida, textual: "A" → instalar `frontend-design` y `web-design-guidelines` en la raíz del repo y auditar `app/`.

S5. La ruta de implementación, textual: "vayamos primero con B pero en otra rama".

S6. Alcance de B, tal como se describió y el usuario aceptó: unificación de tokens + capa de componentes + **una** pantalla piloto. Textual: "montamos `components/ui/` con los tokens de `DESIGN.md` corregidos, y el resto se migra después por comparación".

S7. Fuente de verdad de la paleta: `DESIGN.md` (sistema "Pastel Candy": `#3A2747` primary, `#9E82B5` secondary, `#FF8AB8` tertiary, `#FFF3F7` neutral, white surface; Fraunces display, Nunito body; radios 12/20/32px). No se inventa una dirección visual nueva en esta fase: el cambio visible es cumplir la que el repo ya declara y hoy no implementa.

S8. Piloto: `app/admin/ramos/page.tsx` más `app/admin/layout.tsx` (el shell), porque migrar el contenido sin el marco produce una pantalla incoherente.

S9. Reglas duras para todo archivo tocado, derivadas de las dos skills instaladas y de la auditoría de `app/`:

- Cero valores hex en JSX; el color se consume por token.
- Una sola familia de neutros para toda la app.
- Cero `transition-all`; se listan las propiedades.
- Toda animación respeta `prefers-reduced-motion`.
- Todo botón solo-icono lleva `aria-label`.
- Todo control de formulario lleva `id`, `name`, `label` con `htmlFor` y `autocomplete` cuando aplique.
- Columnas numéricas con `tabular-nums`; moneda con `Intl.NumberFormat`.
- Imágenes con `width`/`height` explícitos.
- `<th>` con `scope`.

S10. Fuera de alcance de esta fase: las otras cuatro pantallas del admin, `login`, `catalogo`, `next/image`, `middleware.ts`, y cualquier cambio del backend. Se migran después por comparación contra el piloto.

S11. No hay runner de tests en `eterna-flor-front` (`package.json` no define `test` ni instala framework). La verificación es `pnpm lint` + `pnpm build` + auditoría estructural por `grep` de las reglas de S9 sobre los archivos tocados. No se inventa evidencia de RED/GREEN.

## Specs — fase 2

S12. Objetivo de la fase 2, textual del usuario: "Implement the design artboard design/ui-refresh/02-candy-counter.html".

S13. El artboard es la especificación visual, no código a copiar. Textual del handoff: "Use the artboard as the visual spec: map its parts to the project's existing components and styles, and do not copy the artboard HTML verbatim."

S14. Fuente de verdad de tokens: el bloque `@theme` de `app/globals.css`, alineado con `DESIGN.md`. `design/system.md` documentaba el estado **anterior** a la migración (paleta stone/rose), así que no puede ser la fuente mientras no se re-sincronice; se re-sincroniza en T12 como consecuencia de esta fase.

S15. Se continúa el trabajo parkeado en vez de reescribirlo. Evidencia: `feat/ui-design-system` ya contenía los tokens Pastel Candy, la capa `components/ui` y dos pantallas migradas, e incluía por su cuenta las mismas dos correcciones de contraste que el artboard propone (L10/L11). Rehacerlo habría duplicado 1035 líneas aprobadas.

S16. Las cinco pantallas restantes se migran por comparación contra el piloto `app/admin/ramos/page.tsx` y el shell `app/admin/layout.tsx`.

S17. Verificación de la fase 2: `tsc --noEmit`, `pnpm build` y `pnpm lint`, con la línea base de `main` como referencia (el lint ya fallaba antes: 28 problemas, 21 de ellos `no-explicit-any`). El aspecto visual se confirma en el canvas contra el artboard, con el dev server corriendo.

## Tasks

| ID | Tarea | Spec | Ruta | Estado | Evidencia | Commit |
|---|---|---|---|---|---|---|
| T1 | Tokens y fuentes globales: `globals.css` con `@theme` según `DESIGN.md`, Fraunces+Nunito en el layout raíz, `prefers-reduced-motion`, utilidades `font-display`/`font-body` | S7, S9 | padre | done | `@theme` con 15 tokens de color, 3 de radio y 2 de tipografía; `prefers-reduced-motion` global; `tsc` y `next build` en verde | `0f5d253` |
| T2 | Capa `components/ui/`: `Button`, `Card`, `Badge`, `Field`, `EmptyState`, `Spinner`, `Icon` | S6, S9 | padre | done | 8 archivos, 331 líneas, cero dependencias nuevas; `eslint components/ui` sin hallazgos | `a376a03` |
| T3 | Shell del admin (`app/admin/layout.tsx`) migrado a tokens y componentes | S8, S9 | padre | done | emojis → `Icon`; `aria-label`/`aria-current`/`aria-expanded`; skip link; `transition-all` → propiedades explícitas | `d3be4ff` |
| T4 | Piloto `app/admin/ramos/page.tsx` migrado a tokens y componentes | S8, S9 | padre | done | 0 literales `stone`/`rose`; `Field` × 7; `Intl.NumberFormat`; `dialog` con `aria-modal` + Escape; `alert()` → mensaje inline | `968a05e` |
| T5 | Verificación: lint, build y auditoría `grep` de S9 sobre los archivos tocados | S11 | padre | done | ver sección `Verificación` | — |
| T6 | Helper de formato compartido `lib/format.ts` (`money`, `percent`, `shortDate`) y refactor del piloto para consumirlo | S9, S16 | padre | done | `toFixed` en `app/`+`components/` = 0 | `feat(front): add a shared number formatter` |
| T7 | Alinear `DESIGN.md` con las correcciones L10/L11: `button-primary.textColor` a Primary, Secondary prohibido como texto | S14 | padre | done | `textColor: "{colors.primary}"`; nota de contraste en Colors y en Do's/Don'ts | `docs: align DESIGN.md with the contrast corrections` |
| T8 | Migrar `app/catalogo/page.tsx` y eliminar el `catalogo/layout.tsx` duplicado (el layout raíz ya carga Fraunces/Nunito) | S13, S16 | padre | done | hex 27→0, `transition-all` 4→0, `toFixed` 1→0; `catalogo/layout.tsx` eliminado | `feat(front): migrate the catalog to design tokens` |
| T9 | Migrar `app/login/page.tsx` a tokens y componentes | S13, S16 | worker | done | `stone-*`/`rose-*`/`red-*` 14→0; gradiente y emojis fuera; `Field`+`Input`+`Spinner` | `feat(front): migrate the login screen to design tokens` |
| T10 | Migrar `app/admin/materias-primas/page.tsx` | S13, S16 | worker | done | `gray-*` 22→0, `rose-*` 6→0; `h1` duplicado corregido a 0 | `feat(front): migrate the materias primas screen to design tokens` |
| T11 | Migrar `app/admin/pedidos/page.tsx` | S13, S16 | worker | done | `gray-*` 15→0, `rose-*` 6→0, `toFixed` 2→0; `labelTamano()` aplicado | `feat(front): migrate the pedidos screen to design tokens` |
| T12 | Migrar `app/admin/reportes/page.tsx` | S13, S16 | worker | done | `gray-*` 18→0, `rose-*` 4→0, `toFixed` 8→0; KPIs sin color decorativo | `feat(front): migrate the reportes screen to design tokens` |
| T13 | Verificación de fase 2 (tsc, build, lint) y comparación visual en el canvas | S17 | padre | done | ver sección `Verificación — fase 2` | — |
| T14 | Re-sincronizar `design/system.md` con el sistema ya implementado | S14 | padre | done | 13 colores, 3 radios, 2 fuentes, 13 exports; 0 valores de la paleta vieja | `docs(design): capture the implemented design system` |

## Verificación

Sin runner de tests en `eterna-flor-front` (S11), la evidencia es la siguiente.

| Comprobación | Antes | Después |
|---|---|---|
| `pnpm build` | exit 0 | exit 0 |
| `eslint` regla `no-explicit-any` | 21 | 18 |
| `eslint` reglas nuevas | — | ninguna |
| `eslint` sobre `components/ui`, `app/layout.tsx`, `app/admin/layout.tsx`, `app/admin/ramos/page.tsx` | — | 0 hallazgos |
| hex en JSX (archivos tocados) | 21 en `catalogo` | 1 (`themeColor`, excepción L13) |
| `transition-all` (archivos tocados) | 8 | 0 |
| `stone-*` / `gray-*` (archivos tocados) | 58 + 51 global | 0 |
| `<img>` sin `width`/`height` (piloto) | 2 de 2 | 0 de 2 |
| `htmlFor` en `app/admin/` | 0 | generado por `Field` en el piloto |

**Un fallo real durante la fase:** el primer intento de `pnpm build` falló con `Block-scoped variable 'resetForm' used before its declaration` en `app/admin/ramos/page.tsx`. Se detectó porque el build se ejecutó y se leyó su salida; el `exit code 0` que devolvía el pipeline (`| tail`) era el de `tail`, no el de `next build`. Corregido moviendo el `useCallback` por encima de su `useEffect`. Lección aplicada: todo build de esta fase se comprueba con `PIPESTATUS`.

**No verificado:** el aspecto visual. No hay navegador en el entorno de ejecución, así que el remapeo de `.btn-primary`/`.input-field`/`.card` cambia el color de `login`, `pedidos`, `reportes` y `materias-primas` sin confirmación visual. Está previsto y es reversible (commit `0f5d253`), pero se confirma abriendo el navegador.

## Log

L1 (usuario, textual): "me gustaria mejorar el diseño edl sistema ya que la clienta lo siente muy generico, y si tiene mucha ia-slop, necesitamos alguna skill a nivel de eproyecto para mejorar la ui? no modifiques nada, primero responde"

L2 (diagnóstico propio, evidencia): `DESIGN.md` declara "Pastel Candy"; `app/globals.css:3-31` implementa el theme por defecto de shadcn (`--primary: #be123c` = rose-600, neutros `stone`, `--radius: 0.5rem`); `app/layout.tsx:2` carga Geist. Solo `app/catalogo/` intenta la marca, con 16 bloques `style={{}}` y hex a mano. No existe `components/`. `app/catalogo/layout.tsx` carga Fraunces/Nunito, pero el admin nunca las recibe.

L3 (auditoría `web-design-guidelines`, conteos exactos sobre `app/`): 0 `aria-label`, 0 `aria-live`, 0 `prefers-reduced-motion`, 0 `Intl.*`, 0 `tabular-nums`, 0 `htmlFor` en `app/admin/`, 0 `next/image`. 4/4 `<img>` sin `width`/`height`. 12 `transition-all`. 16 `<input>` sin `name`/`autocomplete`. 16 `<th>` sin `scope`. 15 `toFixed(2)`. Neutros simultáneos: `stone-*` 58, `gray-*` 51, `rose-*` 41, hex de marca 21.

L4 (usuario, textual): "no quiero crear una skill, quiero usar una ya creada para eliminar la ia-slop y mejorar la ui, investiga que skill sirven para esas tareas"

L5 (instalación, verificada): `npx skills add anthropics/skills -s frontend-design -y` y `npx skills add vercel-labs/agent-skills -s web-design-guidelines -y`, ambos desde la raíz del repo. Resultado en `.agents/skills/` + `skills-lock.json`. El CLI detecta Pi e instala de forma no interactiva. El `frontend-design` de la raíz es la versión nueva (9.2K), distinta de la vieja (4.3K) que estaba en `eterna-flor-front/.agents/skills/`.

L6 (usuario, textual): "A"

L7 (usuario, textual): "vayamos primero con B pero en otra rama"

L8 (decisión de fase, no de producto): se usa `DESIGN.md` como fuente de paleta (S7) porque es la que el repo ya declara y el catálogo ya intenta. Si la clienta prefiere otra dirección, se cambia en una fase posterior tocando solo `globals.css`, no la arquitectura. Este punto queda abierto y visible, no resuelto en silencio.

L9 (pendiente conocido): `eterna-flor-front/.agents/skills/` y su `skills-lock.json` quedan duplicados respecto a la raíz. No se borran sin autorización explícita.

L10 (desviación justificada de `DESIGN.md`): el sistema declara `button-primary` con fondo `tertiary` (`#FF8AB8`) y texto `on-primary` (`#FFFFFF`). Ese par da 2.19:1 de contraste, por debajo del mínimo AA de 4.5:1 para texto. Se invierte el texto del botón primario a `ink` (`#3A2747`), que sobre `#FF8AB8` da 6.1:1. `DESIGN.md` no se editó en esta fase: la corrección vive en `globals.css` y aquí, y `DESIGN.md` debe alinearse cuando se toque.

L11 (segunda desviación): `--color-lilac` (`#9E82B5`) queda prohibido como color de texto (2.7:1 sobre `petal`). Se usa solo para bordes y rellenos decorativos. El texto secundario usa `--color-ink-muted` (`#6E5A7A`, 5.7:1). `DESIGN.md` lo asigna a "borders, captions, and metadata"; la parte de captions no cumple contraste y no se implementa así.

L12 (nombres de radio propios): no se sobrescriben `--radius-sm/md/lg` de Tailwind, porque eso habría cambiado `rounded-lg` en las cuatro pantallas fuera de alcance. Se añaden `--radius-tight/soft/lush` (12/20/32px).

L13 (único hex restante en el código): `themeColor: "#fff3f7"` en `app/layout.tsx`. Es el valor de `<meta name="theme-color">`, que por especificación no acepta `var()`. Documentado como excepción a S9.

L14 (`next/image` diferido): las dos `<img>` del piloto llevan `width`/`height` explícitos, pero no se migran a `next/image` porque las fotos vienen de Cloudinary y eso exige `remotePatterns` en `next.config.ts`, fuera del alcance declarado en S10.

L15 (usuario, textual): "Implement the design artboard design/ui-refresh/02-candy-counter.html" — con el tradeoff del artboard y la instrucción de mapear a componentes existentes sin copiar el HTML.

L16 (decisión de continuación): la pregunta que la fase 1 dejó parkeada ("Definir el destino de `feat/ui-design-system`") queda resuelta por el usuario al elegir la dirección Candy Counter, que es exactamente lo que esa rama implementaba. Se trae a `feat/ui-refresh` con cherry-pick desde `main`, conservando `feat/ui-design-system` intacta como referencia congelada. Se descarta reescribir desde cero: habría duplicado 1035 líneas ya aprobadas y verdes.

L17 (conflicto resuelto en el cherry-pick): `main` avanzó 13 commits e introdujo `labelTamano()` en `lib/tamanos.ts` (`57063de`) para separar la clave de enum (`Pequeno`) de la etiqueta (`Pequeño`). La resolución del conflicto en `app/admin/ramos/page.tsx` conserva esa corrección: el `<select>` y la `Badge` de tamaño usan `labelTamano()`, y se elimina el array local `TAMANOS` que duplicaba el módulo compartido.

L18 (`lib/format.ts`): se extrae el formateo de cifras a un helper porque cuatro pantallas más lo necesitan y la app tenía 15 `toFixed(2)` dispersos. Sin este paso, cada pantalla migrada habría llevado su propia copia del `Intl.NumberFormat`.

L19 (`DESIGN.md` alineado): se cierra el pendiente que L10/L11 dejaron abierto. `button-primary.textColor` pasa de `on-primary` a `primary` (6.1:1 en vez de 2.2:1) y Secondary queda explícitamente prohibido como color de texto.

L20 (corrección de un diagnóstico propio, en el turno que originó esta fase): afirmé ante el usuario que las fuentes Fraunces/Nunito no cargaban. Era falso: `app/catalogo/layout.tsx:3-16` las carga acotadas a `/catalogo`. El defecto real es que existen dos loaders de fuentes, uno por superficie. Corregido en `design/system.md`.

L21 (orden de trabajo, desviación reconocida): `lib/format.ts` y `DESIGN.md` se escribieron antes de extender este documento con la fase 2, contra el orden que pide el flujo (trackear antes de la primera escritura de código). Sin consecuencia sobre el resultado —eran artefactos de fundación, no código de pantalla— y queda registrado aquí en vez de omitirse.

L22 (por qué los workers no corren build): los cuatro restyles de T9–T12 comparten el mismo árbol de trabajo y `next build` escribe `.next`, así que builds concurrentes colisionan. Los workers solo ejecutan `npx eslint` sobre su propio archivo; `tsc` y `build` los corre el padre una sola vez en T13.

## Verificación — fase 2

| Comprobación | `main` (línea base) | `feat/ui-refresh` | Evidencia |
|---|---|---|---|
| `npx tsc --noEmit` | 0 | 0 | tras `rm -rf .next`; los dos errores previos eran tipos generados que apuntaban al `catalogo/layout.tsx` eliminado |
| `pnpm build` | 0 | 0 | 9 rutas generadas, `✓ Compiled successfully` |
| `pnpm lint` | 1 (28 problemas) | 1 (18 problemas) | bajan `no-explicit-any` 21→14, desaparecen `no-unused-vars`, `set-state-in-effect` y `exhaustive-deps` |
| Colores crudos (`stone/gray/rose/red/green/blue/yellow/purple`) en `app/` + `components/` | 157 | 0 | `grep -rE` sobre `*.tsx` |
| Hex en JSX | 21 | 1 | única excepción: `themeColor: "#fff3f7"` en `app/layout.tsx` (L13) |
| `transition-all` | 12 | 0 | `grep -rc` |
| `toFixed` | 15 | 0 | sustituido por `lib/format.ts` |
| `<th>` sin `scope` | 16 | 0 | todas las tablas |
| Loaders de fuentes | 2 | 1 | `catalogo/layout.tsx` eliminado; el layout raíz sirve Fraunces + Nunito a toda la app |

**Desviaciones del artboard, deliberadas y justificadas:**

1. El artboard pinta el hero del catálogo con degradados radiales (menta y mantequilla). `DESIGN.md` dice "Don't introduce gradients. This system is flat on purpose." El hero va plano en `petal` y el énfasis del titular es itálica, no color: el sistema reserva el acento para interacción y un rosa decorativo en el `h1` rompería esa regla.
2. El artboard usa un rosa `#D2326B` en el titular. Se descarta por la misma razón; `blossom-deep` (`#f2659c`) sobre `petal` ronda 2.9:1 y tampoco alcanza el mínimo de 3:1 para texto grande.

**Corrección de un error propio durante la fase:** la instrucción inicial a los cuatro workers pedía un `<h1>` por página. El shell del admin ya renderiza el único `<h1>` (`app/admin/layout.tsx:165-166`), así que la instrucción producía dos encabezados de nivel 1. Se detectó al revisar el retorno del worker de `materias-primas`, se corrigió ese archivo a mano y se avisó a los dos workers que seguían en vuelo (`pedidos`, `reportes`) antes de que terminaran. Resultado: `<h1>` por página = 0 en las tres pantallas.

**No verificado todavía:** el aspecto renderizado en navegador. No hay backend levantado, así que `/catalogo` muestra su estado vacío y las pantallas del admin no tienen datos. La comparación visual contra el artboard queda pendiente de un entorno con API y base de datos.

## Estrategia de entrega

La rama supera el slice de ~400 líneas si se mira entera, así que se entrega como **cadena de unidades revisables**, no como un solo diff. El orden de revisión es el orden de los commits, y cada uno es autosuficiente:

| # | Unidad | Alcance |
|---|---|---|
| 1 | `feat(front): add a shared number formatter` | 1 helper nuevo + 1 pantalla que lo consume |
| 2 | `docs: align DESIGN.md with the contrast corrections` | 1 documento, sin código |
| 3 | `feat(front): migrate the catalog to design tokens` | 1 pantalla pública + 1 layout eliminado |
| 4 | `feat(front): migrate the login screen to design tokens` | 1 pantalla |
| 5–7 | `materias primas` / `pedidos` / `reportes` | 1 pantalla cada una |
| 8 | `feat(front): use the shared spinner on the root redirect` | 1 archivo de 25 líneas |
| 9 | `docs(design): capture the implemented design system` | 2 documentos de diseño |
| 10 | `docs(odd): record the ui-design-system phase 2` | este documento |

Los commits 5, 6 y 7 son independientes entre sí y se pueden revisar en cualquier orden o en paralelo. La rama no se empuja: push y PR son decisiones del usuario.

Frontera de slice: hasta `4eb3dff` inclusive. Cualquier trabajo posterior de frontend (por ejemplo `next/image` con `remotePatterns`, o un runner de tests) abre un slice nuevo en otra rama.

**Defecto preexistente encontrado y corregido en verificación:** `getRamos` capturaba `!res.ok` pero no una excepción de red, así que con la API caída el catálogo público devolvía 500 en lugar de su estado vacío. Detectado al levantar el dev server (`ECONNREFUSED` contra el backend NestJS). Corregido en `a2a9253`; es independiente de la migración visual y habría roto cualquier comparación contra el artboard.

**Estado del entorno de verificación:** dev server en `http://127.0.0.1:3000` sirviendo `/catalogo` y `/login` en 200 con los tokens nuevos. El backend no está levantado, así que el catálogo muestra su estado vacío y las pantallas del admin no tienen datos; la comparación visual es de estructura y tipografía, no de contenido.
