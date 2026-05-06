# 12. Hoja de Ruta Técnica (Fases)

## Fase 1 — Base del sistema (Semanas 1–3)
- Setup de repositorios (frontend Next.js, backend NestJS)
- Configuración de MySQL en Railway + esquema inicial + migraciones
- Módulo de autenticación (login, JWT, guard)
- CRUD de Materias Primas
- CRUD de Ramos con subida de foto a Cloudinary
- CRUD de Recetas con cálculo automático de costo

## Fase 2 — Pedidos y Catálogo (Semanas 4–5)
- Módulo de Pedidos (creación, estados, historial)
- Descuento automático de stock de materias primas al fabricar
- Catálogo público SSR con filtros por tamaño
- Botón de WhatsApp en catálogo con mensaje pre-llenado
- Alertas de stock bajo (ramos y materias primas)

## Fase 3 — Reportes y Exportación (Semana 6)
- Panel de reportes (ingresos, costos, márgenes por período y tamaño)
- Endpoint de exportación CSV (backup manual)
- Pulido de UI mobile-first (TailwindCSS, tipografías grandes, flujos simplificados)

## Fase 4 — QA y Lanzamiento (Semana 7)
- Pruebas end-to-end de los escenarios definidos en los criterios de aceptación del PRD
- Configuración de UptimeRobot para mantener Railway activo
- Entrega y capacitación a la dueña
- Documentación de uso (guía rápida en PDF o video)
