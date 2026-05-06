# 9. Datos

## Modelo de Datos de Alto Nivel

```mermaid
erDiagram
    USUARIO {
        int id PK
        string email
        string password_hash
        datetime created_at
    }

    RAMO {
        int id PK
        string nombre
        enum tamaño "Pequeño|Mediano|Grande|Jumbo"
        string foto_url
        decimal precio_venta
        decimal costo_calculado
        int stock
        boolean activo
        datetime created_at
    }

    MATERIA_PRIMA {
        int id PK
        string nombre
        string unidad
        decimal stock_actual
        decimal costo_unitario
        int stock_minimo_alerta
        datetime created_at
    }

    RECETA {
        int id PK
        int ramo_id FK
        int materia_prima_id FK
        decimal cantidad
    }

    PEDIDO {
        int id PK
        string cliente_nombre
        string cliente_whatsapp
        enum estado "Pendiente|EnPreparacion|Entregado|Pagado"
        string metodo_pago
        decimal monto_total
        date fecha_entrega
        datetime created_at
    }

    PEDIDO_ITEM {
        int id PK
        int pedido_id FK
        int ramo_id FK
        int cantidad
        decimal precio_unitario
    }

    RAMO ||--o{ RECETA : "usa"
    MATERIA_PRIMA ||--o{ RECETA : "usada en"
    PEDIDO ||--o{ PEDIDO_ITEM : "contiene"
    RAMO ||--o{ PEDIDO_ITEM : "incluido en"
```

## Estrategia de Persistencia

- **ORM:** Prisma con migraciones versionadas (`prisma migrate dev` en desarrollo, `prisma migrate deploy` en producción). El schema se define en `schema.prisma` como fuente única de verdad. Nunca se modifica la base de datos directamente en producción sin una migración.
- **Cálculo de costo:** El campo `costo_calculado` en `RAMO` se recalcula en el backend cada vez que se modifica la receta o el costo unitario de una materia prima relacionada.
- **Descuento de stock:** Al registrar la fabricación de un ramo, el backend descuenta automáticamente las materias primas según la receta en una transacción atómica.

## Backups y Retención

- **Backup manual:** El panel de administración expone un endpoint `GET /admin/exportar` que genera y descarga un archivo ZIP con CSVs de todas las entidades.
- **Frecuencia recomendada:** Semanalmente (la dueña lo hace manualmente).
- **Retención de imágenes:** Las imágenes en Cloudinary no se eliminan automáticamente; quedan disponibles indefinidamente dentro del límite del tier gratuito.
- **Sin backup automático en MVP:** Se contempla para v2 mediante un cron job que envíe el CSV por email.
