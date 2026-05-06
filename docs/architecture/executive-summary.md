# Arquitectura — EternaFlor

> Versión: 1.0 | Fecha: 2026-05-05 | Basado en: PRD EternaFlor MVP

---

## 1. Resumen Ejecutivo

EternaFlor es una aplicación web responsive diseñada para una vendedora independiente de ramos florales de plástico en Lima, Perú. El sistema resuelve la gestión manual del negocio (cuadernos, WhatsApp, memoria) mediante cuatro módulos principales: inventario de ramos, control de materias primas, gestión de pedidos y catálogo digital público compartible.

**Principios arquitectónicos guía:**

- **Simplicidad operativa:** Una sola usuaria administradora. Sin complejidad de roles, multi-tenancy ni microservicios.
- **Costo cero:** Toda la infraestructura se sostiene en tiers gratuitos de servicios cloud.
- **Mobile-first:** La dueña opera principalmente desde su celular; el catálogo debe cargar rápido en conexiones móviles estándar.
- **Separación clara frontend/backend:** Next.js en Vercel consume una API REST construida en NestJS desplegada en Railway.
- **Datos propios, siempre exportables:** La dueña puede descargar sus datos en CSV en cualquier momento.