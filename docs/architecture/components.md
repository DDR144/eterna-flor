# 5. Componentes del Sistema

## 5.1 Frontend — Next.js (Vercel)

| Atributo | Detalle |
|---|---|
| **Tecnología** | Next.js 14+ (App Router), TypeScript, TailwindCSS |
| **Responsabilidad** | Renderizar el panel de administración y el catálogo público |
| **Rutas principales** | `/login`, `/admin/*` (protegidas), `/catalogo` (pública) |
| **Interfaces** | Consume API REST del backend vía `fetch` / Axios |
| **Deployment** | Vercel (free tier), auto-deploy desde rama `main` |

**Módulos de UI:**
- `InventarioRamos` — CRUD de ramos con foto y receta de materias primas
- `MateriasPrimas` — CRUD de insumos con alertas de stock bajo
- `Pedidos` — Creación y seguimiento de pedidos con cambio de estado
- `Catalogo` — Vista pública filtrable por tamaño (SSR)
- `Reportes` — Dashboard de ingresos, costos y margen

---

## 5.2 Backend — NestJS (Railway)

| Atributo | Detalle |
|---|---|
| **Tecnología** | NestJS, TypeScript, Prisma ORM, MySQL2 |
| **Responsabilidad** | Lógica de negocio, validaciones, acceso a datos, autenticación |
| **Patrón** | Modular por dominio (módulo por cada entidad principal) |
| **Interfaces** | API REST JSON; comunicación con Cloudinary SDK y MySQL |
| **Deployment** | Railway (free tier), auto-deploy desde rama `main` |

**Módulos NestJS:**
- `AuthModule` — Login, JWT, guard de rutas protegidas
- `RamosModule` — CRUD ramos, cálculo automático de costo por receta
- `MateriasPrimasModule` — CRUD insumos, descuento automático de stock
- `PedidosModule` — CRUD pedidos, cambio de estado, historial
- `CatalogoModule` — Endpoint público de ramos disponibles (stock > 0)
- `ReportesModule` — Agregaciones de ingresos, costos y márgenes
- `UploadModule` — Recepción y reenvío de imágenes a Cloudinary

---

## 5.3 Base de datos — MySQL (Railway)

| Atributo | Detalle |
|---|---|
| **Tecnología** | MySQL 8, gestionado por Railway |
| **Responsabilidad** | Persistencia de todos los datos del negocio |
| **Acceso** | Solo desde el backend NestJS (no expuesto públicamente) |
| **Límite** | 1 GB de almacenamiento en tier gratuito |

---

## 5.4 Almacenamiento de imágenes — Cloudinary

| Atributo | Detalle |
|---|---|
| **Tecnología** | Cloudinary (tier gratuito) |
| **Responsabilidad** | Almacenar y servir fotos de ramos vía CDN |
| **Integración** | El backend usa el SDK oficial de Cloudinary para Node.js |
| **Límite** | 25 GB de almacenamiento, ~25 créditos/mes de transformaciones |