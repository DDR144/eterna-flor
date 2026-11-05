import { readFileSync } from 'fs';
import { resolve } from 'path';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/**
 * Devuelve DATABASE_URL desde el entorno y, si no está, desde el `.env` del
 * directorio actual. Se lee el archivo a mano porque este guard corre antes
 * de que Nest cargue ConfigModule, y porque un script suelto (el seed) no
 * arranca la aplicación.
 */
function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  try {
    const envPath = resolve(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/^DATABASE_URL=(.*)$/m);
    if (match) {
      return match[1].trim().replace(/^["'](.*)["']$/, '$1');
    }
  } catch {
    // .env not found or unreadable
  }

  return undefined;
}

/**
 * Aborta si `DATABASE_URL` no apunta a un host local.
 *
 * Lo llaman los scripts que borran o siembran datos (e2e y seed) antes de
 * tocar la base, porque el `.env` local y las variables de producción se
 * parecen demasiado y una base remota vaciada no se recupera.
 */
export function assertLocalDatabase(url?: string): void {
  const databaseUrl = url ?? resolveDatabaseUrl();

  if (!databaseUrl || databaseUrl.length === 0) {
    throw new Error(
      'Refusing to run: DATABASE_URL is missing or empty. ' +
        'Scripts that clear or seed data may only touch local databases ' +
        '(localhost, 127.0.0.1, or ::1).',
    );
  }

  let host: string | null = null;
  try {
    const parsed = new URL(databaseUrl);
    host = parsed.hostname;
  } catch {
    host = null;
  }

  if (!host || !LOCAL_HOSTS.has(host.toLowerCase())) {
    throw new Error(
      `Refusing to run: DATABASE_URL points to a non-local host (${host ?? 'unparseable'}). ` +
        'Scripts that clear or seed data may only touch local databases ' +
        '(localhost, 127.0.0.1, or ::1).',
    );
  }
}
