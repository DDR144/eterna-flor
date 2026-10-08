import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should throttle POST /auth/login after 5 requests per minute', async () => {
    for (let i = 0; i < 7; i++) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'throttle-test@example.com', password: 'wrong' });

      if (i < 5) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
