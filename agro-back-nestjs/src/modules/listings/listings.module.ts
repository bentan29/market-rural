import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { PrismaModule } from 'src/core/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { ListingsCleanupCronService } from './listings-cleanup-cron.service';

@Module({
  imports: [
    PrismaModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false //- le dice a Passport que no guarde al usuario en una sesión del servidor (cookie + req.session) después de autenticarlo.
    }),
    
  ],
  controllers: [ListingsController],
  providers: [
    ListingsService,
    ListingsCleanupCronService
  ],
})
export class ListingsModule {}
