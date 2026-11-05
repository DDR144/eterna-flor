export const TAMANOS = ['Pequeno', 'Mediano', 'Grande', 'Jumbo'] as const;

export type Tamano = (typeof TAMANOS)[number];

export const TAMANO_LABELS: Record<string, string> = {
  Pequeno: 'Pequeño',
  Mediano: 'Mediano',
  Grande: 'Grande',
  Jumbo: 'Jumbo',
};

export function labelTamano(value: string): string {
  return TAMANO_LABELS[value] ?? value;
}
