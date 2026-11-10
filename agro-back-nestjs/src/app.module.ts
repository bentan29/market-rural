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
  ],
})
export class AppModule {}
