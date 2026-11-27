import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/core/prisma/prisma.module'

const KEEP_MS = 7 * 24 * 60 * 60 * 1000

@Injectable()
export class VerificationCleanupService {
    private readonly logger = new Logger(VerificationCleanupService.name)

    constructor(private readonly prisma: PrismaService) { }

    //- Borra los tokens vencidos hace más de una semana (el límite de reenvíos solo mira la última hora)
    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async removeOld() {
        try {
            const { count } = await this.prisma.verificationToken.deleteMany({
                where: { expiresAt: { lt: new Date(Date.now() - KEEP_MS) } },
            })
            if (count > 0) this.logger.log(`Tokens de verificación borrados: ${count}`)
        } catch (error) {
            this.logger.error(`Limpieza de tokens: ${String(error)}`)
        }
    }
}