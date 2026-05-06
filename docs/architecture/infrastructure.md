# 7. Infraestructura y Deployment

## Ambientes

| Ambiente | Frontend | Backend | Base de datos |
|---|---|---|---|
| **Desarrollo** | `localhost:3000` (Next.js dev) | `localhost:3001` (NestJS dev) | MySQL local o Railway dev branch |
| **Producción** | `eternaflor.vercel.app` | `api-eternaflor.railway.app` | MySQL Railway producción |

No se contempla ambiente de staging en el MVP dado el equipo unipersonal y el presupuesto cero.

## Estrategia de CI/CD

- **Frontend:** Push a rama `main` del repositorio frontend → Vercel detecta el cambio y despliega automáticamente (build + deploy en ~2 min).
- **Backend:** Push a rama `main` del repositorio backend → Railway detecta el cambio y redespliega automáticamente (build Docker interno + deploy).
- **Migraciones de base de datos:** Se ejecutan con `prisma migrate deploy` como parte del proceso de arranque del backend en Railway (configurado en el comando de start del `package.json`), garantizando que el esquema esté siempre actualizado antes de que la API acepte tráfico.

## Escalabilidad

Con el volumen esperado (1 usuaria admin, tráfico de catálogo esporádico), el tier gratuito es suficiente. Si el negocio crece:
- Railway free → Railway Starter ($5/mes) para eliminar el límite de horas y agregar más RAM.
- Agregar caché Redis para el catálogo público (ISR en Next.js es la opción sin costo adicional).
