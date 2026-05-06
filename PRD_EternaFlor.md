# PRD: EternaFlor — Sistema de Gestión para Negocio de Ramos Florales

---

## 1. Resumen Ejecutivo

**Nombre del producto:** EternaFlor

**Problema que resuelve:** Las vendedoras de ramos florales de plástico que operan de forma independiente carecen de herramientas simples para registrar su inventario, controlar sus materias primas, calcular costos, hacer seguimiento de pedidos y mostrar su catálogo a clientes. Todo se maneja manualmente (cuadernos, WhatsApp, memoria), lo que genera pérdidas, desorganización y ventas perdidas.

**Solución propuesta:** Una aplicación web responsive (funciona igual en celular, tablet y computadora) que permite a la dueña gestionar su inventario de ramos terminados organizados por tamaño, sus materias primas y costos de producción, registrar y dar seguimiento a pedidos, ver reportes de ventas, y compartir un catálogo digital público con sus clientes.

**Propuesta de valor única:** Una herramienta hecha a la medida de un negocio familiar pequeño, sin complicaciones técnicas, accesible desde cualquier dispositivo, con un catálogo bonito que se puede compartir por WhatsApp.

---

## 2. Usuarios Objetivo

**Segmento primario — La dueña del negocio:**

- Mujer adulta con conocimientos básicos de smartphone y/o computadora
- Lleva el negocio de forma individual
- Necesita saber qué tiene, cuánto le costó hacer cada ramo, qué vendió, cuánto le deben y qué pedidos están pendientes
- No tiene experiencia con software de gestión empresarial

**Segmento secundario — Los clientes finales:**

- Personas que compran ramos para decoración, regalos o eventos
- Acceden al catálogo desde un enlace compartido por WhatsApp o redes sociales
- Solo necesitan ver fotos, descripciones y precios (sin registrarse)

**Casos de uso principales:**

- La dueña registra un ramo nuevo con foto, tamaño, precio, costo de materiales y cantidad disponible
- La dueña controla el stock de materias primas (flores, cintas, bases, etc.)
- Un cliente recibe el link del catálogo, filtra por tamaño y elige lo que quiere
- La dueña registra un pedido y lo marca como entregado cuando corresponde
- La dueña revisa cuánto ganó esta semana y cuál es su margen por ramo

---

## 3. Objetivos y Métricas de Éxito

**Objetivos de negocio:**

- Reducir el tiempo de control manual del negocio
- Evitar pérdidas por inventario desactualizado, materias primas agotadas o pedidos olvidados
- Conocer el costo real de producción de cada ramo para fijar precios con margen
- Aumentar ventas mediante un catálogo digital compartible

**KPIs principales:**

- Número de pedidos registrados por semana
- Margen de ganancia promedio por ramo y por tamaño
- Tasa de pedidos completados vs. pendientes
- Visitas al catálogo público

**Criterios de éxito MVP:**

- La dueña puede registrar y consultar inventario sin ayuda técnica
- El sistema calcula automáticamente el costo y margen de cada ramo
- El catálogo puede ser visto por clientes desde cualquier dispositivo sin instalar nada
- Los pedidos pueden marcarse como pagados/entregados

---

## 4. Alcance del MVP

**Features incluidos en v1:**

- Gestión de ramos terminados con tamaño (Pequeño, Mediano, Grande, Jumbo), foto, precio de venta, costo calculado y stock
- Gestión de materias primas (nombre, unidad, stock disponible, costo unitario)
- Receta por ramo: qué materias primas usa y en qué cantidad (para calcular costo automáticamente)
- Registro de pedidos con estados y seguimiento
- Catálogo público por URL, filtrable por tamaño de ramo
- Panel de ventas con ingresos, costos y margen

**Features explícitamente excluidos del MVP:**

- Pagos en línea / pasarela de pagos
- Aplicación móvil nativa (iOS/Android)
- Gestión multiusuario / varios empleados
- Notificaciones automáticas a clientes
- Integración directa con WhatsApp Business API
- Otros tipos de arreglos (centros de mesa, coronas, etc.)

**Criterios de lanzamiento:**

- La dueña puede operar el sistema desde su celular y computadora sin necesitar ayuda
- El catálogo se puede compartir con un solo clic

---

## 5. Requerimientos Funcionales

**Módulo de Inventario — Ramos:**

- Agregar ramo: nombre, tamaño (Pequeño / Mediano / Grande / Jumbo), foto, precio de venta, cantidad disponible
- Asociar materias primas al ramo (receta) para cálculo automático del costo de producción
- Ver costo de producción y margen de ganancia por ramo
- Editar y eliminar ramos
- Alerta cuando el stock de un ramo está bajo

**Módulo de Materias Primas:**

- Registrar materia prima: nombre, unidad de medida (unidades, metros, rollos, etc.), stock actual, costo unitario
- Actualizar stock al registrar compras de insumos
- Ver listado con alertas de stock bajo
- Descuento automático de materias primas al registrar la fabricación de un ramo

**Módulo de Pedidos:**

- Crear pedido: nombre del cliente, contacto (WhatsApp), ramos pedidos con tamaño y cantidad, fecha de entrega, método de pago y monto total
- Estados del pedido: Pendiente → En preparación → Entregado → Pagado
- Historial de pedidos con búsqueda por cliente o fecha

**Módulo de Catálogo Público:**

- Vista pública sin login, accesible por URL única y compartible
- Muestra foto, nombre, tamaño, descripción y precio de cada ramo disponible
- Filtros por tamaño: Pequeño, Mediano, Grande, Jumbo
- Botón de contacto directo por WhatsApp para consultar o hacer un pedido
- Ramos con stock 0 no aparecen en el catálogo

**Módulo de Ventas / Reportes:**

- Resumen del día y la semana: ingresos totales, costo total, ganancia neta
- Margen promedio por período y desglosado por tamaño de ramo
- Lista de pedidos pendientes de entrega o cobro
- Ramos más vendidos por tamaño

---

## 6. Requerimientos No Funcionales

- **Rendimiento:** Carga del catálogo en menos de 3 segundos en conexión móvil estándar
- **Compatibilidad:** Accesible desde cualquier navegador moderno en celular, tablet y computadora (Chrome, Safari, Edge)
- **Seguridad:** Panel de administración protegido con usuario y contraseña; el catálogo es público pero de solo lectura
- **Usabilidad:** Interfaz simple con textos grandes, pocos pasos por acción, diseño responsive optimizado para celular pero usable en escritorio
- **Respaldo:** Los datos deben poder exportarse para evitar pérdidas

---

## 7. Modelo de Negocio

- **Monetización:** Herramienta interna para uso familiar, sin costo ni modelo comercial
- **Go-to-market:** Desarrollo directo para el negocio familiar; no requiere estrategia de distribución
- **Moneda y mercado:** Soles peruanos (PEN), español, Lima, Perú

---

## 8. Suposiciones y Riesgos

**Suposiciones clave:**

- La dueña tiene smartphone y/o computadora con acceso a internet
- Los clientes principalmente coordinan por WhatsApp
- El negocio opera de forma individual (un solo usuario administrador)
- Las fotos de los ramos se toman con celular
- El negocio vende únicamente ramos clasificados por tamaño (Pequeño, Mediano, Grande, Jumbo)

**Riesgos identificados:**

- Resistencia a adoptar la herramienta si la curva de aprendizaje es alta
- Costo de producción inexacto si las recetas no se mantienen actualizadas
- Pérdida de datos si no hay respaldo periódico
- Fotos de baja calidad pueden hacer el catálogo poco atractivo

**Dependencias externas:**

- Servicio de almacenamiento de imágenes
- Acceso estable a internet para usar el panel

---

## 9. Criterios de Aceptación

**Definición de "done" para el MVP:**

- La dueña puede registrar un ramo nuevo con tamaño, foto y receta de materiales en menos de 3 minutos
- El sistema calcula automáticamente el costo y margen del ramo
- Un cliente puede ver y filtrar el catálogo por tamaño desde cualquier dispositivo sin necesidad de cuenta
- Un pedido puede crearse, actualizarse y marcarse como completado
- El panel muestra ingresos, costos y ganancia del día y la semana correctamente

**Escenarios de prueba principales:**

- Agregar ramo con tamaño "Grande", foto y receta → costo calculado automáticamente → aparece en catálogo bajo filtro "Grande"
- Registrar compra de materias primas → stock se actualiza correctamente
- Crear pedido con ramo "Mediano x2" → aparece en pendientes → marcar como entregado → sale de pendientes
- Stock de ramo llega a 0 → desaparece del catálogo público automáticamente
- Ver reporte semanal con margen de ganancia desglosado por tamaño de ramo
