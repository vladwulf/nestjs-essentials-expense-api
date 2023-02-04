import { CacheModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { AuthModule } from './auth/auth.module';
import { AdminGuard, SessionGuard } from './auth/guards';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ExpenseModule } from './expense/expense.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';

@Module({
  imports: [
    SchedulerModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ExpenseModule,
    ScheduleModule.forRoot(),
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
    ConfigModule.forRoot({
      isGlobal: true,
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
  controllers: [AppController],
})
export class AppModule {}
