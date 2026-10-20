import type { SVGProps } from "react";

/**
 * Iconos de trazo, sin dependencias externas.
 * Decorativos por defecto: `aria-hidden`, porque el texto que acompaña
 * (o el `aria-label` del botón) es quien nombra la acción.
 */
const paths: Record<string, string[]> = {
  ramos: ["M9 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M15 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M12 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M12 15v6"],
  materias: ["M12 21c0-7 3-11 8-11 0 6-3 11-8 11Z", "M12 21c0-5-2-8-6-8 0 4 2 8 6 8Z"],
  pedidos: ["M12 3 3 8v8l9 5 9-5V8l-9-5Z", "M3 8l9 5 9-5", "M12 13v8"],
  reportes: ["M4 4v16h16", "M8 17v-5", "M13 17V8", "M18 17v-8"],
  catalogo: ["M6 3 4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-2-4H6Z", "M4 7h16", "M16 11a4 4 0 0 1-8 0"],
  salir: ["M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3", "m16 17 5-5-5-5", "M21 12H9"],
  mas: ["M12 5v14", "M5 12h14"],
  cerrar: ["M18 6 6 18", "M6 6l12 12"],
  basura: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"],
  izquierda: ["m15 18-6-6 6-6"],
  derecha: ["m9 18 6-6-6-6"],
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "h-5 w-5",
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
