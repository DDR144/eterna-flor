# eterna-flor-front

Frontend de EternaFlor: Next.js 16 (App Router) + React 19 + Tailwind CSS 4. Sirve el catálogo público y el panel de administración.

La documentación del proyecto completo está en el [README raíz](../README.md); los tokens visuales implementados, en [`design/system.md`](../design/system.md).

## Requisitos

- Node 24 (`.node-version`)
- pnpm 12
- La API corriendo (por defecto en `http://localhost:3001`)

## Instalación y arranque

```bash
pnpm install
pnpm dev     # http://localhost:3000
```

El cliente HTTP (`lib/api.ts`) usa `NEXT_PUBLIC_API_URL`; si no está definida, cae a `http://localhost:3001`. En producción se configura en Vercel.

## Comandos

```bash
pnpm dev     # next dev, puerto 3000
pnpm build   # next build
pnpm start   # next start sobre el build
pnpm lint    # eslint
```

No hay script `format` ni runner de tests en este paquete.

## Estructura

```
app/
  layout.tsx              fuentes (Fraunces + Nunito) y estilos raíz
  globals.css             tokens @theme, clases heredadas y guard de reduce-motion
  page.tsx                redirección según haya sesión
  login/                  acceso de la administradora
  catalogo/               catálogo público, renderizado en el servidor
  admin/                  panel
    layout.tsx            shell: navegación lateral
    ramos/                ramos con receta, costo y stock
    materias-primas/      insumos y alertas
    pedidos/              pedidos agrupados por fecha de entrega
    reportes/             ventas, márgenes y exportación CSV
components/ui/            Button, Card, Badge, Field, EmptyState, Spinner, Icon
lib/
  api.ts                  cliente HTTP y token
  auth-context.tsx        estado de sesión
  format.ts               money, percent, shortDate (es-PE)
  tamanos.ts              etiqueta con acento del catálogo → miembro del enum
```

## Convenciones

- **Lee `node_modules/next/dist/docs/` antes de escribir código.** Next.js 16 cambia APIs respecto a versiones anteriores y a los datos de entrenamiento; respeta los avisos de deprecación.
- Tailwind CSS 4 vía `@tailwindcss/postcss`; **no hay `tailwind.config.js`**. Los tokens son el bloque `@theme` de `app/globals.css`.
- No escribas hex en JSX: usa los tokens (`bg-ink`, `text-ink-muted`, `bg-blossom`, `border-line`, …) y los radios `rounded-tight/soft/lush`.
- Reutiliza `components/ui/` en lugar de inventar marcado nuevo para el mismo elemento.
- La paleta, las reglas de contraste y las variantes de cada componente están documentadas en `design/system.md`; `DESIGN.md` es la intención declarada del sistema "Pastel Candy".

## Despliegue

Vercel, plan Hobby, auto-deploy desde `main`. El commit desplegado y el procedimiento completo están en [`docs/estado-del-proyecto.md`](../docs/estado-del-proyecto.md).
