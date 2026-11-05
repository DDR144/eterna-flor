// El guard vive en `src/common` para que también lo use el seed de Prisma,
// que no está bajo `test/`. Se re-exporta desde aquí para no tocar los
// imports de los specs e2e.
export { assertLocalDatabase } from '../../src/common/local-database';
