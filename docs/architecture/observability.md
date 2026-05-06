# 10. Observabilidad

## Logging

- **Backend (NestJS):** Logger nativo de NestJS con niveles `log`, `warn`, `error`. En producción los logs se visualizan en el dashboard de Railway en tiempo real.
- **Eventos críticos logueados:** Login exitoso/fallido, creación/modificación de pedidos, errores de subida a Cloudinary, errores de base de datos.
- **No se almacenan logs en base de datos** en el MVP (Railway los retiene ~7 días en su dashboard).

## Métricas

- **Vercel Analytics:** Habilitado por defecto en Vercel free tier. Provee métricas de visitas al catálogo público (page views, país, dispositivo) sin configuración adicional.
- **Railway Metrics:** Dashboard de Railway muestra CPU, RAM y requests del backend en tiempo real.

## Alertas

- **Stock bajo de ramos:** Calculado en frontend al consultar el inventario; se muestra un badge visual cuando `stock ≤ 2`.
- **Stock bajo de materias primas:** Calculado contra `stock_minimo_alerta`; visible en la lista de materias primas.
- **No hay alertas por email ni push en el MVP.** La dueña revisa el panel para detectarlos.
