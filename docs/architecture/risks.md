# 11. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Railway suspende el servicio por inactividad (free tier) | Media | Alto | Configurar un ping periódico (ej. UptimeRobot gratuito) para mantener el servicio activo |
| Pérdida de datos si no se realiza exportación manual | Alta | Alto | Recordatorio visual en el panel ("Última exportación: hace X días") |
| Fotos de baja calidad degradan el catálogo | Alta | Medio | Cloudinary aplica compresión automática; documentar recomendaciones de foto para la dueña |
| Costo calculado incorrecto si recetas no se actualizan | Media | Medio | Mostrar alerta cuando el costo unitario de una materia prima cambia y hay ramos afectados |
| Resistencia a adopción por curva de aprendizaje | Media | Alto | Diseño mobile-first, flujos de máximo 3 pasos, textos grandes y claros |
| Límite de almacenamiento MySQL (1 GB) superado | Baja | Medio | Con el volumen esperado (< 100 ramos, < 50 pedidos/mes) no se alcanza en años; monitorear en Railway |
| Cambio de tier gratuito en Railway o Cloudinary | Baja | Alto | Documentar proceso de migración a alternativas (PlanetScale, Supabase para DB; Uploadthing para imágenes) |
