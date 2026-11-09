# Guía Rápida de EternaFlor

## ¿Qué es EternaFlor?
EternaFlor es un sistema de gestión para tu negocio de ramos florales. Te permite:
- Controlar tu inventario de materias primas
- Gestionar tus ramos y recetas
- Registrar y dar seguimiento a pedidos
- Ver reportes de ventas y márgenes
- Compartir un catálogo digital con tus clientes

---

## Primeros Pasos

### 1. Acceso al Sistema
- Abre tu navegador y accede a: `https://eterna-flor.vercel.app/login`
- La primera visita del día puede tardar cerca de un minuto: el servidor se suspende cuando nadie lo usa y necesita despertar.
- Ingresa tu correo electrónico y contraseña

### 2. Crear Materias Primas
Antes de crear ramos, necesitas registrar tus materiales:
1. Ve a **Materias Primas** en el menú
2. Click en **+ Nueva Materia Prima**
3. Completa los campos:
   - **Nombre**: Ej. "Flores de rosa", "Cinta de satén"
   - **Unidad**: Ej. "unidades", "metros", "rollos"
   - **Stock Actual**: Cantidad disponible
   - **Costo Unitario**: Precio por unidad
   - **Stock Mínimo**: Alerta cuando baje de este número

### 3. Crear Ramos
1. Ve a **Ramos** en el menú
2. Click en **+ Nuevo Ramo**
3. Completa:
   - **Nombre**: Ej. "Ramo Rosa Mediano"
   - **Tamaño**: Pequeño, Mediano, Grande o Jumbo
   - **Precio de Venta**: S/ precio de venta
   - **Stock**: Cantidad disponible
   - **Foto**: Sube una foto del ramo
4. **Receta**: Agrega las materias primas que usa el ramo
   - Esto calcula automáticamente el costo de producción
   - El margen = Precio de venta - Costo calculado

---

## Gestión de Pedidos

### Crear un Pedido
1. Ve a **Pedidos** en el menú
2. Click en **+ Nuevo Pedido**
3. Completa:
   - **Nombre del cliente**
   - **WhatsApp** (para coordinar entrega)
   - **Método de pago** (opcional)
   - **Fecha de entrega** (opcional)
4. Agrega los ramos pedidos

**Nota**: Al crear un pedido, el stock de ramos se descuenta automáticamente.

### Estados del Pedido
- **Pendiente**: Nuevo pedido, sin empezar
- **En Preparación**: Estás trabajando en él
- **Entregado**: Ya entregaste al cliente
- **Pagado**: Cliente pagó (puede ser diferente de entregado)

### Cambiar Estado
1. En la lista de pedidos, usa el dropdown junto a cada pedido
2. Selecciona el nuevo estado
3. Se actualiza automáticamente

### Eliminar Pedido
- Solo pedidos en estado Pendiente o En Preparación pueden eliminarse
- Al eliminar, el stock de ramos se restaura automáticamente

---

## Catálogo Público

### Acceso
- Tu catálogo público está en: `https://eterna-flor.vercel.app/catalogo`
- Comparte este enlace con tus clientes por WhatsApp

### Filtros
- Los clientes pueden filtrar por tamaño (Pequeño, Mediano, Grande, Jumbo)
- Solo aparecen Ramos con stock > 0

### Contacto por WhatsApp
- Cada ramo tiene un botón "Consultar"
- Abre WhatsApp con un mensaje pre-llenado

---

## Reportes

### Resumen de Ventas
1. Ve a **Reportes** en el menú
2. Selecciona el período: Hoy, Esta semana, Este mes, Todo el tiempo
3. Verás:
   - **Ingresos**: Total vendido
   - **Costos**: Costo de producción total
   - **Margen**: Ganancia (Ingresos - Costos)
   - **% Margen**: Porcentaje de ganancia

### Margen por Tamaño
- Tabla que muestra ingresos, costos y margen por cada tamaño de ramo

### Pedidos Pendientes
- Lista de pedidos que aún no están entregados o pagados

### Ramos Más Vendidos
- Top 10 de ramos más vendidos en el período seleccionado

---

## Exportar Datos

### Hacer Backup
1. Ve a **Reportes**
2. Click en **Exportar CSV**
3. Se descargará un archivo `.csv` con tres secciones:
   - Ramos (nombre, precio, costo, stock)
   - Materias Primas (nombre, stock, costo)
   - Pedidos (cliente, estado, monto, items)

**Recomendación**: Haz esta exportación semanal y guárdala en tu computadora.

---

## Consejos

### Mantén tus recetas actualizadas
- Si cambia el costo de una materia prima, el costo del ramo se actualiza automáticamente si vuelves a guardarlo

### Stock bajo
- Las materias primas con stock bajo se muestran con alerta roja
- Los ramos con stock ≤ 2 también muestran alerta

### Fotos de buena calidad
- Sube fotos claras y bien iluminadas
- Esto hace más atractivo tu catálogo

---

## ¿Necesitas Ayuda?
Si tienes dudas o problemas, contacta al soporte técnico.

**Última revisión**: Noviembre 2026
**Versión**: 1.1