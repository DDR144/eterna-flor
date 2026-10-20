import { readFileSync } from 'fs';
import { resolve } from 'path';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

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

export function assertLocalDatabase(url?: string): void {
  const databaseUrl = url ?? resolveDatabaseUrl();

  if (!databaseUrl || databaseUrl.length === 0) {
    throw new Error(
      'Refusing to run tests: DATABASE_URL is missing or empty. ' +
        'Tests perform destructive database cleanup, so only local databases ' +
        '(localhost, 127.0.0.1, or ::1) are allowed.',
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
      `Refusing to run tests: DATABASE_URL points to a non-local host (${host ?? 'unparseable'}). ` +
        'Tests perform destructive database cleanup, so only local databases ' +
        '(localhost, 127.0.0.1, or ::1) are allowed.',
    );
  }
}
