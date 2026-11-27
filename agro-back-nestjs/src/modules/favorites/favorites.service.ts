import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationDto } from 'src/common/dto'
import { LISTING_CARD_SELECT, publicListingWhere, toListingCard } from 'src/common/utils/listing.util'
import { PrismaService } from 'src/core/prisma/prisma.module'

@Injectable()
export class FavoritesService {

    constructor(private readonly prismaClient: PrismaService) { }

    //? ---- Toggle para agregar y quitar de favoritos
    async toggleFavorite(userId: string, listingId: string) {

        //- Primero se intenta quitar: así siempre se puede sacar un favorito, aunque la publicación ya no se vea
        const removed = await this.prismaClient.favorite.deleteMany({ where: { userId, listingId } })
        if (removed.count > 0) return { isFavorite: false }

        //- Para agregar, la publicación tiene que verse hoy en público (también evita el error de clave foránea con un id inventado)
        const listing = await this.prismaClient.listing.findFirst({
            where: { AND: [{ id: listingId }, publicListingWhere()] },
            select: { id: true },
        })
        if (!listing) throw new NotFoundException('La publicación ya no está disponible')

        try {
            await this.prismaClient.favorite.create({ data: { userId, listingId } })
        } catch (error) {
            //- Dos clics casi simultáneos: el otro ya lo agregó, y el resultado es el que se quería
            const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
            if (!duplicate) throw error
        }

        return { isFavorite: true }
    }

    //? ---- Mis favoritos (con la misma forma que el catálogo)
    async getAllOurFavorites(pagination: PaginationDto, userId: string) {
        const now = new Date()

        const page = pagination.page ?? 1
        const limit = pagination.limit ?? 8
        const skip = (page - 1) * limit

        //- Solo se listan las que hoy se ven en público (el total cuenta con la misma regla)
        const where: Prisma.FavoriteWhereInput = { userId, listing: publicListingWhere(now) }

        const [rows, total] = await Promise.all([
            this.prismaClient.favorite.findMany({
                where,
                //- Sin orden, la paginación puede repetir o saltear filas entre páginas
                orderBy: [{ createdAt: 'desc' }, { listingId: 'asc' }],
                skip,
                take: limit,
                select: { listing: { select: LISTING_CARD_SELECT } },
            }),
            this.prismaClient.favorite.count({ where }),
        ])

        return {
            items: rows.map(({ listing }) => toListingCard(listing, now)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    }

    //? ---- Solo los ids: es lo único que necesitan las tarjetas para pintar el corazón
    async ids(userId: string) {
        const rows = await this.prismaClient.favorite.findMany({
            where: { userId },
            select: { listingId: true },
            take: 1000,
        })
        return rows.map((row) => row.listingId)
    }
}