# eterna-flor-back

API REST de EternaFlor: NestJS 11 + Prisma 5 sobre PostgreSQL. Gestiona el catálogo público, los ramos con su receta y costo calculado, las materias primas, los pedidos y los reportes del panel.

La documentación del proyecto completo está en el [README raíz](../README.md); la arquitectura, en [`docs/architecture.md`](../docs/architecture.md).

## Requisitos

- Node 24 (`.node-version`)
- pnpm 12 (`packageManager` en `package.json`)
- PostgreSQL local

## Instalación

```bash
pnpm install
```

pnpm 12 exige aprobar los scripts de postinstall; la lista está en `pnpm-workspace.yaml` (`allowBuilds`). Si falta, el install sale con código 1.

## Configuración

Copia `.env.example` a `.env` y completa:

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | sí | Cadena de conexión que usa la aplicación en runtime |
| `DIRECT_URL` | sí | Cadena directa, sin pooler; la usan las migraciones |
| `JWT_SECRET` | sí | Firma de los tokens; sin ella la API no arranca |
| `FRONTEND_URL` | en producción | Origen exacto para CORS, sin barra final |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | para fotos | Sin ellas la API arranca, pero subir una foto responde 500 |
| `NODE_ENV` | en producción | `production` activa la cookie `secure` |
| `PORT` | no | Render la inyecta; en local el valor por defecto es 3001 |

## Base de datos

```bash
pnpm exec prisma generate      # regenera el cliente tras cambiar el schema
pnpm exec prisma migrate dev   # crea y aplica una migración en local
pnpm exec prisma studio        # visor de la base
pnpm run seed                  # datos de prueba locales
```

El seed siembra los cuatro tamaños de ramo, pedidos en los cuatro estados, materias primas por encima y por debajo de su umbral, y el usuario local `admin@eternaflor.local` / `local1234`. Solo borra filas cuyo nombre empieza por `[prueba] `, `Materia prima de prueba: ` o `Cliente de prueba `, así que se puede repetir.

Si lo que quieres es **mirar** la aplicación y no probarla, `pnpm run seed:demo` vacía la base local y siembra un catálogo presentable: cinco ramos visibles con recetas, uno agotado, uno archivado y pedidos en los cuatro estados. Ese es el dataset que usan las capturas del README. También se niega a correr fuera de localhost.

**El seed y los e2e se niegan a correr si `DATABASE_URL` no apunta a `localhost`, `127.0.0.1` o `::1`** (`src/common/local-database.ts`). Ambos borran datos: nunca deben apuntar a la base de producción.

## Comandos

```bash
pnpm run start:dev   # watch mode, puerto 3001
pnpm run start:prod   # node dist/main
pnpm run build       # prisma generate && nest build
pnpm run lint        # eslint sobre src, test, prisma y apps/libs, con --fix
pnpm run format      # prettier --write
pnpm run test        # unitarios (src/**/*.spec.ts)
pnpm run test -- src/auth/auth.service.spec.ts   # un solo archivo
pnpm run test:e2e    # e2e con test/jest-e2e.json, requiere base local
```

Corre `pnpm run lint` **antes** de `pnpm run test`; no están encadenados.

## Estructura

```
src/
  auth/              login, registro cerrado al primer usuario, perfil, JWT
  catalogo/          endpoint público del catálogo
  materias-primas/   insumos, stock y alertas
  ramos/             ramos, receta, costo calculado
  pedidos/           pedidos, descuento y restauración de stock
  reportes/          resumen, pendientes, más vendidos, exportación CSV
  health/            keep-alive sin base de datos (ver el comentario del controlador)
  common/            guards, filtros, servicios (Cloudinary), enum-label, guard de base local
prisma/              schema.prisma, migraciones y seed
test/                suites e2e
```

## Trampas conocidas

- **Enums acentuados.** En el schema el miembro es `Pequeno` con `@map("Pequeño")`; Prisma acepta el miembro y el frontend envía la etiqueta. La traducción vive en `common/enum-label.ts` y `ramos/dto/ramo.dto.ts`. Misma trampa en `EnPreparacion` / `En preparación`.
- **`/health` no debe consultar la base.** Es el ping que mantiene Render despierto; tocar Neon agotaría sus horas de cómputo del mes.
- **Las migraciones no corren en el arranque.** `start:prod` es `node dist/main`; se aplican a mano con `prisma migrate deploy`.

## Despliegue

Render, web service Free, auto-deploy desde `main`. El procedimiento y las variables están en [`docs/estado-del-proyecto.md`](../docs/estado-del-proyecto.md).
