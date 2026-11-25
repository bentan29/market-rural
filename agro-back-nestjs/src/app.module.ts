import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.service';
import { RedisModule } from './core/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { SessionModule } from './modules/session/session.module';
import { ListingsModule } from './modules/listings/listings.module';
import { SellerModule } from './modules/seller/seller.module';
import { SeedModule } from './modules/seed/seed.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { BullModule } from '@nestjs/bullmq';
import { envs } from './core/config';
import { MailModule } from './modules/mail/mail.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    AuthModule,
    SellerModule,
    PrismaModule,
    RedisModule,
    UserModule,
    TokensModule,
    SessionModule,
    ListingsModule,
    SeedModule,
    SubscriptionModule,
    FavoritesModule,

    //? BullMQ
    BullModule.forRoot({
      connection: {
        host: envs.redisHost ?? 'localhost',
        port: envs.redisPort ?? 6379,
        password: envs.redisPassword,
        tls: envs.redisTls ? {} : undefined,
      },
      prefix: "marketrural"
    }),

    MailModule,

    InquiryModule,

    CloudinaryModule
  ],
})
export class AppModule { }
