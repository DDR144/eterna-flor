# Feature: ui-design-system

**Rama:** `feat/ui-design-system`
**Objetivo:** unificar el sistema visual de EternaFlor en una sola fuente de verdad (`DESIGN.md` → tokens de Tailwind), crear la capa de componentes que hoy no existe, y migrar una pantalla piloto (`admin/ramos`) como prueba de que el resto se puede migrar por comparación.
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

## Tasks

| ID | Tarea | Spec | Ruta | Commit |
|---|---|---|---|---|
| T1 | Tokens y fuentes globales: `globals.css` con `@theme` según `DESIGN.md`, Fraunces+Nunito en el layout raíz, `prefers-reduced-motion`, utilidades `font-display`/`font-body` | S7, S9 | padre | por definir |
| T2 | Capa `components/ui/`: `Button`, `Card`, `Badge`, `Field`, `EmptyState`, `Spinner`, `Icon` | S6, S9 | padre | por definir |
| T3 | Shell del admin (`app/admin/layout.tsx`) migrado a tokens y componentes | S8, S9 | padre | por definir |
| T4 | Piloto `app/admin/ramos/page.tsx` migrado a tokens y componentes | S8, S9 | padre | por definir |
| T5 | Verificación: lint, build y auditoría `grep` de S9 sobre los archivos tocados | S11 | padre | por definir |

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
