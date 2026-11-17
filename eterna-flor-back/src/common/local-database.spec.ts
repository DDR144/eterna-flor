import { assertLocalDatabase } from './local-database';

/**
 * La guardia de la que dependen el seed, el sembrador de demostración y la
 * suite e2e: los tres borran filas y el `.env` local está a un copiar y pegar
 * de producción. Sin este spec, una regresión que aflojara la comparación de
 * host no la detendría nada.
 */
describe('assertLocalDatabase', () => {
  it('rechaza un host remoto y lo nombra', () => {
    expect(() =>
      assertLocalDatabase('postgresql://user:pass@remote.example.com:5432/db'),
    ).toThrow(
      'Refusing to run: DATABASE_URL points to a non-local host (remote.example.com).',
    );
  });

  it('rechaza una URL vacía', () => {
    expect(() => assertLocalDatabase('')).toThrow(
      'Refusing to run: DATABASE_URL is missing or empty.',
    );
  });

  it('rechaza una URL que no se puede parsear', () => {
    expect(() => assertLocalDatabase('no-es-una-url')).toThrow(
      'Refusing to run: DATABASE_URL points to a non-local host (unparseable).',
    );
  });

  it.each(['localhost', '127.0.0.1', '[::1]'])('acepta el host %s', (host) => {
    expect(() =>
      assertLocalDatabase(`postgresql://user:pass@${host}:5432/db`),
    ).not.toThrow();
  });

  it('rechaza una IPv6 sin corchetes, que una URL real nunca escribe así', () => {
    expect(() =>
      assertLocalDatabase('postgresql://user:pass@::1:5432/db'),
    ).toThrow(/non-local host \(unparseable\)/);
  });

  it('no se deja engañar por un subdominio ni por un prefijo', () => {
    expect(() =>
      assertLocalDatabase(
        'postgresql://user:pass@localhost.example.com:5432/db',
      ),
    ).toThrow(/non-local host \(localhost\.example\.com\)/);
    expect(() =>
      assertLocalDatabase('postgresql://user:pass@127.0.0.1.example.com/db'),
    ).toThrow(/non-local host/);
  });
});
