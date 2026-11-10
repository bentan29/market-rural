import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from 'src/core/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
