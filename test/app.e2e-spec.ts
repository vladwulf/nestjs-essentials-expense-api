import {
  CacheModule,
  CACHE_MANAGER,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as redisStore from 'cache-manager-redis-store';
import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { AuthModule } from '../src/auth/auth.module';
import { SessionGuard, AdminGuard } from '../src/auth/guards';
import { ExpenseModule } from '../src/expense/expense.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserModule } from '../src/user/user.module';
import { AuthDto } from '../src/auth/dto';
import { CreateExpenseDto, UpdateExpenseDto } from 'src/expense/dto';

describe('App E2E', () => {
  let app: INestApplication;
  let redisSessionClient: RedisClientType;
  let cookie = '';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        ExpenseModule,
        CacheModule.registerAsync<RedisClientOptions>({
          isGlobal: true,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            return {
              store: redisStore,
              url: config.getOrThrow('REDIS_URL'),
            };
          },
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: SessionGuard,
        },
        {
          provide: APP_GUARD,
          useClass: AdminGuard,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    const configService = app.get(ConfigService);

    // redis connection logic
    const RedisStore = connectRedis(session);
    const redisClient = createClient({
      url: configService.getOrThrow('REDIS_URL'),
      legacyMode: true,
    });
    redisSessionClient = redisClient as RedisClientType;

    app.use(
      session({
        secret: configService.getOrThrow('SESSION_SECRET'),
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({
          client: redisClient,
        }),
      }),
    );

    await redisClient.connect().catch((error) => {
      throw error;
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    // clean db
    const prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(async () => {
    const cache = app.get(CACHE_MANAGER);
    const cacheClient: RedisClientType = cache.store.getClient();

    await cacheClient.quit();
    await redisSessionClient.disconnect();
    return app.close();
  });

  describe('AppModule', () => {
    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });

  describe('Auth', () => {
    describe('signup', () => {
      it('should signup', () => {
        const authDto: AuthDto = {
          email: 'vlad@gmail.com',
          password: '12345',
        };
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(authDto)
          .expect('Set-Cookie', /connect.sid/)
          .expect(201);
      });
    });
    describe('signin', () => {
      it('should signin', () => {
        const authDto: AuthDto = {
          email: 'vlad@gmail.com',
          password: '12345',
        };
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send(authDto)
          .expect('Set-Cookie', /connect.sid/)
          .expect(200)
          .expect(({ headers }) => {
            cookie = headers?.['set-cookie'];
          });
      });
    });

    describe('user', () => {
      it('should get current user', () => {
        return request(app.getHttpServer())
          .get('/user/me')
          .set('Cookie', cookie)
          .expect(200)
          .then((res) => {
            expect(res.body).toBeTruthy();
          });
      });
    });
  });

  describe('Expense', () => {
    let expenseId: number;
    it('should create expenses', async () => {
      const expense1: CreateExpenseDto = {
        title: 'First expense',
        description: 'Description of the first expense',
        amount: '50',
        date: new Date(),
      };

      const expense2: CreateExpenseDto = {
        title: 'Second expense',
        description: 'Description of the second expense',
        amount: '20',
        date: new Date(),
      };

      await request(app.getHttpServer())
        .post('/expense')
        .set('Cookie', cookie)
        .send(expense1)
        .expect(201);

      await request(app.getHttpServer())
        .post('/expense')
        .set('Cookie', cookie)
        .send(expense2)
        .expect(201);
    });
    it('should get all expenses', () => {
      return request(app.getHttpServer())
        .get('/expense')
        .set('Cookie', cookie)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              data: expect.any(Array),
              count: 2,
              hasMore: false,
            }),
          );

          expenseId = body.data[0].id;
        });
    });
    it('should get expense by id', async () => {
      await request(app.getHttpServer())
        .get(`/expense/${0}`)
        .set('Cookie', cookie)
        .expect(404)
        .expect(({ body }) => {
          expect(body.message).toEqual('Resource does not exist');
        });

      await request(app.getHttpServer())
        .get(`/expense/${expenseId}`)
        .set('Cookie', cookie)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBeTruthy();
        });
    });
    it('should edit expense by id', () => {
      const dto: UpdateExpenseDto = {
        description: 'Updated description',
      };
      return request(app.getHttpServer())
        .patch(`/expense/${expenseId}`)
        .set('Cookie', cookie)
        .send(dto)
        .expect(200)
        .expect(({ body }) => {
          expect(body.description).toEqual(dto.description);
        });
    });
    it('should delete expense by id', async () => {
      await request(app.getHttpServer())
        .delete(`/expense/${expenseId}`)
        .set('Cookie', cookie)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/expense/${expenseId}`)
        .set('Cookie', cookie)
        .expect(404);
    });
  });
});
