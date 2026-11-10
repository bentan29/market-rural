import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PrismaModule } from 'src/core/prisma/prisma.service';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [PrismaModule]
})
export class SeedModule {}
