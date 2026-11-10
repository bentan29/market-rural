import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.module';
import { SEED_PLANS } from './data/seed-plans';

@Injectable()
export class SeedService {

    constructor(
        private readonly prismaClient: PrismaService,
    ){}

    async runSeed() {
        await this.seedPlans();
        return { message: 'Seed completado ✅' };
    }

    private async seedPlans() {
        console.log('🌱 Seeding planes...');

        for (const plan of SEED_PLANS) {
            await this.prismaClient.plan.upsert({
                where: {name: plan.name},
                update: plan,
                create: plan
            })
        }
    }

}
