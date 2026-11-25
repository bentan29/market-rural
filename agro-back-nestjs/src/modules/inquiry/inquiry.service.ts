import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.module';
import { INQUIRY_QUEUE } from './inquiries.constants';
import { Queue } from 'bullmq';
import { publicListingWhere } from 'src/common/utils/listing.util';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_EMAIL = 3
const MAX_PER_LISTING = 10

@Injectable()
export class InquiryService {

    private readonly logger = new Logger(InquiryService.name)

    constructor(
        private readonly prismaClient: PrismaService,
        @InjectQueue(INQUIRY_QUEUE) private readonly queue: Queue
    ) { }


    //? -- Creamos una consulta en BD
    async create(slug: string, dto: CreateInquiryDto) {

        //- Solo se puede escribir a publicaciones que hoy se ven en público
        const listing = await this.prismaClient.listing.findFirst({
            where: { AND: [{ slug }, publicListingWhere()] },
            select: { id: true, sellerId: true },
        })
        if (!listing) throw new NotFoundException('La publicación ya no está disponible')

        //- Límites en la base de datos (la IP que ve Nest es siempre la del servidor de Next)
        const since = new Date(Date.now() - WINDOW_MS)

        const [byEmail, byListing] = await Promise.all([
            this.prismaClient.inquiry.count({ where: { email: dto.email, createdAt: { gte: since } } }),
            this.prismaClient.inquiry.count({ where: { listingId: listing.id, createdAt: { gte: since } } }),
        ])

        if (byEmail >= MAX_PER_EMAIL || byListing >= MAX_PER_LISTING) {
            throw new HttpException(
                'Enviaste varios mensajes seguidos. Probá de nuevo en un rato.',
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }

        const inquiry = await this.prismaClient.inquiry.create({
            data: {
                listingId: listing.id,
                sellerId: listing.sellerId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone ?? null,
                message: dto.message,
            },
            select: { id: true },
        })

        //- Se encola solo el id: el procesador lee los datos de la base de datos ()
        try {
            await this.queue.add(
                'notify',
                { inquiryId: inquiry.id },
                {
                    jobId: `inquiry-${inquiry.id}`, // evita encolar dos veces la misma consulta
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 30_000 }, // 30 s, 1 min, 2 min, 4 min
                    removeOnComplete: { age: 24 * 3600, count: 1000 },
                    removeOnFail: { age: 7 * 24 * 3600 },
                },
            )
        } catch (error) {
            //- Redis caído: la consulta ya está guardada, el visitante no tiene por qué enterarse
            this.logger.error(`No se pudo encolar la consulta ${inquiry.id}: ${error instanceof Error ? error.message : error}`)
            await this.prismaClient.inquiry
                .update({ where: { id: inquiry.id }, data: { notifyError: 'No se pudo encolar la notificación' } })
                .catch(() => undefined)
        }

        return {ok: true}

    }

}
