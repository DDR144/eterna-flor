/**
 * Formato de cifras para toda la interfaz.
 *
 * Vive en un solo sitio a propósito: la app tenía 15 `toFixed(2)` repartidos,
 * así que dos pantallas podían mostrar el mismo importe de forma distinta.
 * `es-PE`/`PEN` es la convención del negocio (soles peruanos).
 */

const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const percentage = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** `185` → `S/ 185.00` */
export function money(value: number): string {
  return soles.format(value);
}

/** `59.63` → `59.6 %` */
export function percent(value: number): string {
  return `${percentage.format(value)} %`;
}

/**
 * Fecha de entrega legible. La API entrega ISO; una fecha inválida o
 * ausente devuelve `null` para que la vista decida qué mostrar, en lugar
 * de imprimir "Invalid Date" al usuario.
 */
export function shortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
