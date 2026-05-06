# Apéndice — Asunciones Consolidadas

| # | Categoría | Decisión |
|---|---|---|
| 1 | Escala esperada | 1 usuario admin, hasta 100 ramos, hasta 50 pedidos/mes |
| 2 | Modelo de deployment | Vercel (frontend) + Railway (backend + MySQL); sin servidor propio |
| 3 | Stack tecnológico | **Next.js (React) + NestJS + MySQL + Cloudinary** ✏️ *revisada* |
| 4 | Autenticación | Email + contraseña, JWT en cookie httpOnly, sesión de 8 horas |
| 5 | Presupuesto de infraestructura | **$0 USD/mes — solo tiers gratuitos (Vercel, Railway, Cloudinary)** ✏️ *revisada* |
| 6 | Equipo de desarrollo | Desarrollo individual, sin CI/CD automatizado (Vercel/Railway auto-deploy desde main) |
| 7 | Backups | Exportación manual en CSV desde el panel; sin backup automático en MVP |
| 8 | Compliance | Sin regulaciones aplicables; datos de clientes limitados a nombre y WhatsApp |
| 9 | Moneda y formato | Soles peruanos (PEN), 2 decimales, sin soporte multi-moneda |
| 10 | Almacenamiento de imágenes | Cloudinary, referenciado por URL, máximo 5 MB por imagen |
| 11 | Catálogo público | URL fija compartible, sin autenticación, SSR en Next.js |
| 12 | Disponibilidad | Best-effort (~99%), sin SLA formal; UptimeRobot para mantener Railway activo |
| 13 | Internacionalización | Solo español, sin i18n |
| 14 | Versionado de API | Sin versionado formal en MVP |