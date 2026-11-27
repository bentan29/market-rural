import { InjectQueue } from '@nestjs/bullmq'
import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common'
import type { User } from '@prisma/client'
import { Queue } from 'bullmq'
import { PaginationDto } from 'src/common/dto'
import { publicListingWhere } from 'src/common/utils/listing.util'
import { PrismaService } from 'src/core/prisma/prisma.module'
import { CreateInquiryDto } from './dto/create-inquiry.dto'
import { INQUIRY_QUEUE } from './inquiries.constants'

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_USER = 5
const MAX_PER_LISTING = 10

@Injectable()
export class InquiryService {

    private readonly logger = new Logger(InquiryService.name)

    constructor(
        private readonly prismaClient: PrismaService,
        @InjectQueue(INQUIRY_QUEUE) private readonly queue: Queue,
    ) { }

    //? -- Crear una consulta (requiere cuenta con email verificado)
    async create(slug: string, user: User, dto: CreateInquiryDto) {

        //- Solo se puede escribir a publicaciones que hoy se ven en público
        const listing = await this.prismaClient.listing.findFirst({
            where: { AND: [{ slug }, publicListingWhere()] },
            select: { id: true, sellerId: true, seller: { select: { userId: true } } },
        })
        if (!listing) throw new NotFoundException('La publicación ya no está disponible')

        if (listing.seller.userId === user.id) {
            throw new ForbiddenException('No podés consultar tu propia publicación')
        }

        //- Límites por usuario y por publicación
        const since = new Date(Date.now() - WINDOW_MS)
        const [byUser, byListing] = await Promise.all([
            this.prismaClient.inquiry.count({ where: { userId: user.id, createdAt: { gte: since } } }),
            this.prismaClient.inquiry.count({ where: { listingId: listing.id, createdAt: { gte: since } } }),
        ])
        if (byUser >= MAX_PER_USER || byListing >= MAX_PER_LISTING) {
            throw new HttpException(
                'Enviaste varias consultas seguidas. Probá de nuevo en un rato.',
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }

        const inquiry = await this.prismaClient.inquiry.create({
            data: {
                listingId: listing.id,
                sellerId: listing.sellerId,
                userId: user.id,
                //- Nombre y email de la cuenta (no del formulario): el vendedor responde a ese email
                name: user.fullName?.trim() || user.email.split('@')[0],
                email: user.email,
                phone: dto.phone,
                message: dto.message,
            },
            select: { id: true },
        })

        //- Se encola solo el id: el procesador lee los datos de la base de datos
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

        return { ok: true }
    }

    //? -- Consultas que yo envié
    async getSent(userId: string, pagination: PaginationDto) {
        const page = pagination.page ?? 1
        const limit = pagination.limit ?? 8
        const where = { userId }

        const [rows, total] = await Promise.all([
            this.prismaClient.inquiry.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    message: true,
                    createdAt: true,
                    listing: { select: { title: true, slug: true, status: true } },
                    seller: { select: { displayName: true, slug: true } },
                },
            }),
            this.prismaClient.inquiry.count({ where }),
        ])

        return {
            items: rows.map((row) => ({ ...row, message: row.message.slice(0, 300) })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    }

    //? -- Consultas que recibí (vendedor)
    async getReceived(sellerId: string, pagination: PaginationDto) {
        const page = pagination.page ?? 1
        const limit = pagination.limit ?? 8
        const where = { sellerId }

        const [rows, total, unread] = await Promise.all([
            this.prismaClient.inquiry.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    message: true,
                    createdAt: true,
                    readAt: true,
                    listing: { select: { title: true, slug: true } },
                },
            }),
            this.prismaClient.inquiry.count({ where }),
            this.prismaClient.inquiry.count({ where: { sellerId, readAt: null } }),
        ])

        return { items: rows, total, unread, page, totalPages: Math.ceil(total / limit) }
    }

    //? -- Marcar como leída (solo el vendedor dueño)
    async markRead(sellerId: string, id: string) {
        const { count } = await this.prismaClient.inquiry.updateMany({
            where: { id, sellerId, readAt: null },
            data: { readAt: new Date() },
        })

        //- Si no actualizó nada: o ya estaba leída, o no es suya. Se distingue para no dar un falso "ok"
        if (count === 0) {
            const owned = await this.prismaClient.inquiry.count({ where: { id, sellerId } })
            if (owned === 0) throw new NotFoundException('Consulta no encontrada')
        }

        return { ok: true }
    }
}