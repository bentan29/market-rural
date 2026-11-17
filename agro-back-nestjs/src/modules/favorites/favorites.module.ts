import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PrismaModule } from 'src/core/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PrismaModule,
    
    //* Passport - Esto dice a NestJS que cuando usemos los guards @UseGuards(AuthGuard()) sin especificar estrategia, 
    //*  use jwt por defecto. Sin esto, AuthGuard() no sabría qué estrategia usar.
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false //- le dice a Passport que no guarde al usuario en una sesión del servidor (cookie + req.session) después de autenticarlo.
    }),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
