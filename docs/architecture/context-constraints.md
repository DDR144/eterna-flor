# 2. Contexto y Restricciones

**Escala objetivo:**
- 1 usuario administrador (la dueña)
- Hasta 100 ramos en catálogo
- Hasta 50 pedidos por mes
- Tráfico público al catálogo: esporádico y de bajo volumen (familia, clientes por WhatsApp)

**Restricciones de negocio:**
- Presupuesto de infraestructura: $0 USD/mes (solo tiers gratuitos)
- Moneda única: Soles peruanos (PEN)
- Idioma único: español
- Operación individual: sin empleados ni colaboradores con acceso al sistema
- Tipos de producto fijos: ramos en 4 tamaños (Pequeño, Mediano, Grande, Jumbo)

**Restricciones técnicas:**
- Frontend desplegado en Vercel (free tier)
- Backend + MySQL desplegados en Railway (free tier: 500 horas/mes, ~512 MB RAM, 1 GB MySQL)
- Almacenamiento de imágenes en Cloudinary (free tier: 25 créditos/mes, ~25 GB de transformaciones)
- Sin servidor dedicado ni VPS propio
- Sin CI/CD automatizado en MVP; despliegue manual vía push a rama principal

**Compliance / regulatorio:**
- No aplican regulaciones de datos sensibles (no se manejan datos de salud, financieros de terceros ni datos sujetos a GDPR)
- Los datos de clientes capturados son mínimos: nombre y número de WhatsApp, usados únicamente para coordinar entregas