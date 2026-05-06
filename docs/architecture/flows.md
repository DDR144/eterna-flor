# 6. Flujos Principales

## 6.1 Autenticación de la dueña

```mermaid
sequenceDiagram
    participant D as Dueña (Browser)
    participant FE as Next.js
    participant BE as NestJS
    participant DB as MySQL

    D->>FE: GET /login
    FE-->>D: Formulario de login
    D->>FE: POST email + contraseña
    FE->>BE: POST /auth/login
    BE->>DB: SELECT usuario WHERE email=?
    DB-->>BE: Usuario encontrado
    BE->>BE: Validar bcrypt hash
    BE-->>FE: JWT en cookie httpOnly
    FE-->>D: Redirect a /admin/dashboard
```

---

## 6.2 Registro de un ramo nuevo con foto y receta

```mermaid
sequenceDiagram
    participant D as Dueña
    participant FE as Next.js
    participant BE as NestJS
    participant CL as Cloudinary
    participant DB as MySQL

    D->>FE: Completa formulario + sube foto
    FE->>BE: POST /ramos (multipart/form-data)
    BE->>CL: Upload imagen
    CL-->>BE: URL pública de imagen
    BE->>DB: INSERT ramo con URL imagen
    BE->>DB: INSERT receta (materias primas x cantidad)
    BE->>BE: Calcular costo = Σ(cantidad × costo_unitario)
    BE-->>FE: Ramo creado con costo calculado
    FE-->>D: Ramo aparece en inventario y catálogo
```

---

## 6.3 Cliente visita el catálogo público

```mermaid
sequenceDiagram
    participant C as Cliente (WhatsApp link)
    participant FE as Next.js SSR
    participant BE as NestJS
    participant DB as MySQL

    C->>FE: GET /catalogo?tamaño=Grande
    FE->>BE: GET /catalogo?tamaño=Grande
    BE->>DB: SELECT ramos WHERE stock > 0 AND tamaño=Grande
    DB-->>BE: Lista de ramos disponibles
    BE-->>FE: JSON con ramos + URLs Cloudinary
    FE-->>C: Página HTML renderizada con fotos y precios
    C->>FE: Click "Consultar por WhatsApp"
    FE-->>C: Abre WhatsApp con mensaje pre-llenado
```

---

## 6.4 Registro y cierre de un pedido

```mermaid
sequenceDiagram
    participant D as Dueña
    participant FE as Next.js
    participant BE as NestJS
    participant DB as MySQL

    D->>FE: Crea pedido (cliente, ramos, fecha entrega)
    FE->>BE: POST /pedidos
    BE->>DB: INSERT pedido + items (estado: Pendiente)
    BE->>DB: UPDATE stock ramos (-cantidad pedida)
    BE-->>FE: Pedido creado
    D->>FE: Marca pedido como "Entregado"
    FE->>BE: PATCH /pedidos/:id {estado: Entregado}
    BE->>DB: UPDATE pedido estado
    BE-->>FE: Pedido actualizado
    FE-->>D: Sale de la lista de pendientes
```