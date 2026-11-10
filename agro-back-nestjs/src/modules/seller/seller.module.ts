import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { PrismaModule } from 'src/core/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [

    PrismaModule,
    SubscriptionModule,

    //* Passport - Esto dice a NestJS que cuando usemos los guards @UseGuards(AuthGuard()) sin especificar estrategia, 
    //*  use jwt por defecto. Sin esto, AuthGuard() no sabría qué estrategia usar.
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false //- le dice a Passport que no guarde al usuario en una sesión del servidor (cookie + req.session) después de autenticarlo.
    }),

  ],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
