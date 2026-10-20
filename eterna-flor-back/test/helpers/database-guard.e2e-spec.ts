import { assertLocalDatabase } from './database-guard';

describe('assertLocalDatabase', () => {
  it('allows localhost', () => {
    expect(() =>
      assertLocalDatabase('postgresql://user:pass@localhost:5432/db'),
    ).not.toThrow();
  });

  it('allows 127.0.0.1', () => {
    expect(() =>
      assertLocalDatabase('postgresql://user:pass@127.0.0.1:5432/db'),
    ).not.toThrow();
  });

  it('allows ::1', () => {
    expect(() =>
      assertLocalDatabase('postgresql://user:pass@[::1]:5432/db'),
    ).not.toThrow();
  });

  it('rejects a remote host', () => {
    expect(() =>
      assertLocalDatabase(
        'postgresql://user:pass@db.example.com:5432/eternaflor',
      ),
    ).toThrow(/DATABASE_URL points to a non-local host \(db\.example\.com\)/);
  });

  it('rejects empty DATABASE_URL', () => {
    expect(() => assertLocalDatabase('')).toThrow(/DATABASE_URL is missing/);
  });

  it('rejects malformed DATABASE_URL', () => {
    expect(() => assertLocalDatabase('not-a-valid-url')).toThrow(
      /non-local host/,
    );
  });
});
