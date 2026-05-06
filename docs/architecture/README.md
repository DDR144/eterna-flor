# Arquitectura EternaFlor

Esta carpeta contiene la documentación de arquitectura del sistema. El contenido se ha dividido por secciones autónomas.

---

## Tabla de contenido

- [Resumen ejecutivo](./executive-summary.md)
- [Contexto y restricciones](./context-constraints.md)
- [ADR — Decisiones arquitectónicas](./adr/)
    - [ADR-001: Cliente-servidor (Next.js + NestJS)](./adr/adr-001.md)
    - [ADR-002: MySQL en Railway](./adr/adr-002.md)
    - [ADR-003: Cloudinary imágenes](./adr/adr-003.md)
    - [ADR-004: JWT en cookie](./adr/adr-004.md)
    - [ADR-005: SSR Catálogo](./adr/adr-005.md)
    - [ADR-006: Exportación CSV](./adr/adr-006.md)
- [Diagrama de alto nivel](./diagram-overview.md)
- [Componentes del sistema](./components.md)
- [Flujos principales (diagramas)](./flows.md)
- [Infraestructura y deployment](./infrastructure.md)
- [Seguridad](./security.md)
- [Modelo de datos y persistencia](./data.md)
- [Observabilidad y métricas](./observability.md)
- [Riesgos y mitigaciones](./risks.md)
- [Hoja de ruta técnica](./roadmap.md)
- [Apéndice: Asunciones](./appendix.md)

---

Cada archivo puede leerse de forma independiente o enlazarse desde herramientas externas. Para editar o ampliar, modificar el archivo correspondiente antes de actualizar el índice (README.md).