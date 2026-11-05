/**
 * Prisma's `@map` gives an enum value a second spelling: the member name the
 * client code uses (`EnPreparacion`, `Pequeno`) and the label stored in
 * PostgreSQL (`En preparación`, `Pequeño`). The API returns member names,
 * clients send back whatever label they display, and a comparison against a
 * single spelling drops the other one without failing.
 *
 * Comparing without accents, case or separators resolves both spellings to
 * the member the Prisma client expects, so the fix does not need a second
 * hard-coded copy of the labels to stay in sync. The separators matter:
 * `EnPreparacion` and `En preparación` differ by the space as well as by the
 * accent, and an accent-only comparison still drops that one.
 */
function normalizar(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function parseEnumLabel<T extends string>(
  members: readonly T[],
  value?: string,
): T | undefined {
  if (!value) {
    return undefined;
  }

  const buscado = normalizar(value);
  return members.find((member) => normalizar(member) === buscado);
}
