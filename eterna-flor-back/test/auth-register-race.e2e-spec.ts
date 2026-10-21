import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/auth/auth.service';
import { assertLocalDatabase } from './helpers/database-guard';

const TEMP_DB_NAME = 'eternaflor_racetest';

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  const content = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  if (!match) {
    throw new Error('DATABASE_URL not found in environment or .env file');
  }
  return match[1].trim().replace(/^["'](.*)["']$/, '$1');
}

function buildTempDatabaseUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.pathname = `/${TEMP_DB_NAME}`;
  return url.toString();
}

describe('AuthService registerAdmin race (real concurrency)', () => {
  let baseDatabaseUrl: string;
  let tempDatabaseUrl: string;
  let prisma: PrismaClient;
  let authService: AuthService;

  beforeAll(async () => {
    baseDatabaseUrl = resolveDatabaseUrl();
    assertLocalDatabase(baseDatabaseUrl);

    tempDatabaseUrl = buildTempDatabaseUrl(baseDatabaseUrl);
    assertLocalDatabase(tempDatabaseUrl);

    const baseUrl = new URL(baseDatabaseUrl);
    const adminPassword = baseUrl.password;

    execSync(
      `psql -h ${baseUrl.hostname} -p ${baseUrl.port} -U ${baseUrl.username} -d postgres -c "DROP DATABASE IF EXISTS \\"${TEMP_DB_NAME}\\";"`,
      {
        env: { ...process.env, PGPASSWORD: adminPassword },
        stdio: 'ignore',
      },
    );
    execSync(
      `psql -h ${baseUrl.hostname} -p ${baseUrl.port} -U ${baseUrl.username} -d postgres -c "CREATE DATABASE \\"${TEMP_DB_NAME}\\";"`,
      {
        env: { ...process.env, PGPASSWORD: adminPassword },
        stdio: 'ignore',
      },
    );

    execSync('pnpm exec prisma migrate deploy', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: tempDatabaseUrl,
        DIRECT_URL: tempDatabaseUrl,
      },
      stdio: 'ignore',
    });

    prisma = new PrismaClient({ datasourceUrl: tempDatabaseUrl });
    await prisma.$connect();

    const jwtService = { sign: jest.fn() } as unknown as JwtService;
    authService = new AuthService(
      prisma as unknown as import('../src/common/services/prisma.service').PrismaService,
      jwtService,
    );
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }

    const baseUrl = new URL(baseDatabaseUrl);
    const adminPassword = baseUrl.password;
    execSync(
      `psql -h ${baseUrl.hostname} -p ${baseUrl.port} -U ${baseUrl.username} -d postgres -c "DROP DATABASE IF EXISTS \\"${TEMP_DB_NAME}\\";"`,
      {
        env: { ...process.env, PGPASSWORD: adminPassword },
        stdio: 'ignore',
      },
    );
  });

  it('allows exactly one of two concurrent first-user registrations', async () => {
    const [first, second] = await Promise.allSettled([
      authService.registerAdmin('first-race@example.com', 'password123'),
      authService.registerAdmin('second-race@example.com', 'password123'),
    ]);

    const outcomes = [first, second];
    const successes = outcomes.filter(
      (outcome): outcome is PromiseFulfilledResult<unknown> =>
        outcome.status === 'fulfilled',
    );
    const failures = outcomes.filter(
      (outcome): outcome is PromiseRejectedResult =>
        outcome.status === 'rejected',
    );

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    const winner = successes[0].value as Record<string, unknown>;
    expect(winner).toHaveProperty('id');
    expect(winner).toHaveProperty('email');
    expect(winner).toHaveProperty('createdAt');
    expect(winner).not.toHaveProperty('passwordHash');

    expect(failures[0].reason).toBeInstanceOf(ForbiddenException);

    const userCount = await prisma.usuario.count();
    expect(userCount).toBe(1);
  });
});
