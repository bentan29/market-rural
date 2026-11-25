import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/core/prisma/prisma.module'
import { CloudinaryService } from '../cloudinary/cloudinary.service'

const STALE_AFTER_MS = 24 * 60 * 60 * 1000

//? ----------- Limpieza de fotos huérfanas ------------------ 

@Injectable()
export class ImagesCleanupService {
    private readonly logger = new Logger(ImagesCleanupService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) {}

    //- Fotos subidas hace más de 24 h que nunca se guardaron en una publicación
    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async removeOrphans() {
        try {
            const stale = await this.cloudinary.findStaleUnattached(STALE_AFTER_MS)
            if (stale.length === 0) return

            //- Antes de borrar se consulta la base: una foto en uso NUNCA se borra, aunque conserve la etiqueta
            const inUse = await this.prisma.listingImage.findMany({
                where: { publicId: { in: stale } },
                select: { publicId: true },
            })
            const inUseIds = new Set(inUse.map((image) => image.publicId))

            const orphans = stale.filter((id) => !inUseIds.has(id))

            await Promise.all([
                this.cloudinary.destroy(orphans),
                this.cloudinary.untag([...inUseIds]),
            ])

            this.logger.log(`Fotos huérfanas borradas: ${orphans.length}`)
        } catch (error) {
            this.logger.error(`Limpieza de fotos: ${String(error)}`)
        }
    }
}