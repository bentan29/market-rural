import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { isFeatured, LISTING_CARD_SELECT, publicListingWhere, toListingCard } from 'src/common/utils/listing.util';
import { PrismaService } from 'src/core/prisma/prisma.module';

@Injectable()
export class FavoritesService {

    constructor(
        private readonly prismaClient: PrismaService
    ){}

    //? --------------------------------------------
    //? ---- Toggle para agregar y quitar de favoritos .
    async toggleFavorite(userId: string, listingId: string) {

        //1 - Verificamos que ya lo tengmoas en favorito para quitarlo o sino agregarlo
        const existing = await this.prismaClient.favorite.findUnique({
            where: {
                userId_listingId: {userId, listingId}
            }
        })

        //2 - Si ya lo teniamos en favoritos lo quitamos
        if(existing) {
            await this.prismaClient.favorite.delete({
                where: {
                    userId_listingId: {userId, listingId}
                }
            })
            return {isFavorite: false}
        }

        //3 - Si no lo teniamos lo agregamos
        await this.prismaClient.favorite.create({
            data: {
                userId,
                listingId
            }
        })

        return {isFavorite: true}

    }

    //? -----------------------------------------
    //? ---- Tomamos todos nuestros favoritos .
    async getAllOurFavorites(paginationFavourites: PaginationDto, userId: string) {

        const now = new Date()

        const page = paginationFavourites.page ?? 1
        const limit = paginationFavourites.limit ?? 4
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

    //? --- Buscamos los favoritos pasandoles el id de usuario
    //? --- Solo los ids: es lo único que necesitan las tarjetas para pintar el corazón
    async ids(userId: string) {
        const rows = await this.prismaClient.favorite.findMany({
            where: { userId },
            select: { listingId: true },
            take: 1000,
        })
        return rows.map((row) => row.listingId)
    }
}
