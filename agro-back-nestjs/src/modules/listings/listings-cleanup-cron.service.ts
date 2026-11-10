import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/core/prisma/prisma.module'

@Injectable()
export class ListingsCleanupCronService {
    constructor(private readonly prismaClient: PrismaService) {}

    //- Este cron lo vamos a usar cuando se pierde la vigencia del tiempo para 
    // publicaciones destacadas

    //- Idempotente: si corre dos veces (varias instancias), la segunda no encuentra nada
    @Cron(CronExpression.EVERY_HOUR)
    async clearExpiredFeatured() {
        await this.prismaClient.listing.updateMany({
            where: { featuredUntil: { lt: new Date() } },
            data: { featuredUntil: null },
        })
    }
}