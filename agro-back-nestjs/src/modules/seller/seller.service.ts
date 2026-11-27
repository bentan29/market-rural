import {
    ConflictException, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common'
import { ListingStatus, Prisma, Role, SubscriptionStatus } from '@prisma/client'
import { uniqueSlug } from 'src/common/utils/slug.util'
import { CreateSellerDto } from './dto/create-seller.dto'
import { PrismaService } from 'src/core/prisma/prisma.module'
import { DEFAULT_SELLER_PLAN } from 'src/common/constants/plans-name.constants'
import { publicListingWhere } from 'src/common/utils/listing.util'
import { isSubscriptionActive } from 'src/common/utils/suscription.util'

@Injectable()
export class SellerService {
    constructor(
        private readonly prismaClient: PrismaService,
    ) { }

    //! ================ Rutas privadas ================

    //? --- Creamos el vendedor
    async create(userId: string, dto: CreateSellerDto) {
        //- Buscamos si ya existe como seller
        const existing = await this.prismaClient.seller.findUnique({
            where: { userId },
            select: { id: true, deletedAt: true },
        })
        //- Si no tenemos deletedAt no fue borrado entonces existe un vendedor activo
        if (existing && !existing.deletedAt) throw new ConflictException('Ya tenés un perfil de vendedor')

        //- Tomamos el plan de la DB
        const plan = await this.prismaClient.plan.findFirst({
            where: { name: DEFAULT_SELLER_PLAN, isActive: true },
        })
        if (!plan) throw new InternalServerErrorException('Plan inicial no configurado')

        try {
            return existing
                ? await this.reactivate(existing.id, userId, plan.id, dto)
                : await this.createNew(userId, plan.id, dto)
        } catch (error) {
            //- Dos requests simultáneas (mismo nombre o doble clic): gana una, la otra recibe esto
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Ese nombre ya está en uso o ya tenés un perfil. Probá de nuevo.')
            }
            throw error
        }
    }

    //? --------- Crear vendedor
    private async createNew(userId: string, planId: string, dto: CreateSellerDto) {
        //- Slug
        const slug = await uniqueSlug(dto.displayName, async (candidate) => {
            const found = await this.prismaClient.seller.findUnique({
                where: { slug: candidate },
                select: { id: true },
            })
            return !!found
        })
        //- Creamos vendedor
        return this.prismaClient.$transaction(async (tx) => {
            const seller = await tx.seller.create({
                data: {
                    ...dto,
                    slug,
                    userId,
                    subscription: {
                        create: {
                            planId,
                            status: SubscriptionStatus.ACTIVE,
                            expiresAt: null
                        },
                    },
                },
                include: {
                    subscription: { include: { plan: true } },
                }
            })

            //- Actualizamos el ROLE a SELLER
            await this.promoteToSeller(tx, userId)
            return seller
        })

    }

    //? --------- Reactivar cuenta de vendedor
    //?- Vuelve quien se había dado de baja: se conserva el slug y las publicaciones (reaparecen solas)
    private async reactivate(sellerId: string, userId: string, planId: string, dto: CreateSellerDto) {

        return this.prismaClient.$transaction(async (tx) => {
            const seller = await tx.seller.update({
                where: { id: sellerId },
                data: {
                    displayName: dto.displayName,
                    phone: dto.phone,
                    country: dto.country,
                    location: dto.location,
                    //- El formulario manda el estado completo: un opcional ausente significa "quitarlo"
                    about: dto.about ?? null,
                    whatsapp: dto.whatsapp ?? null,
                    website: dto.website ?? null,
                    deletedAt: null,
                    subscription: {
                        upsert: {
                            create: {
                                planId,
                                status: SubscriptionStatus.ACTIVE,
                                expiresAt: null
                            },
                            update: {
                                planId,
                                status: SubscriptionStatus.ACTIVE,
                                startedAt: new Date(),
                                expiresAt: null,
                                cancelledAt: null,
                            },
                        },
                    },
                },
                include: { subscription: { include: { plan: true } } }
            })

            await this.promoteToSeller(tx, userId)
            return seller
        })
    }

    //? --------- Cambiamos el ROLE a SELLER ... Solo sube USER -> SELLER (un ADMIN no se degrada)
    private promoteToSeller(tx: Prisma.TransactionClient, userId: string) {
        return tx.user.updateMany({
            where: { id: userId, role: Role.USER },
            data: { role: Role.SELLER },
        })
    }


    //?- Perfil del vendedor activo. El guard garantiza que existe; el null-check es por el tipo y por una carrera con la baja
    async findMine(sellerId: string) {
        const seller = await this.prismaClient.seller.findUnique({
            where: { id: sellerId },
            select: {
                displayName: true,
                slug: true,
                avatarUrl: true,
                about: true,
                phone: true,
                whatsapp: true,
                website: true,
                country: true,
                location: true,
                createdAt: true,
            },
        })
        if (!seller) throw new NotFoundException('Todavía no tenés perfil de vendedor')
        return seller
    }

    //? -- Datos del perfil dado de baja, para precargar el formulario de reactivación.
    //? -- Devuelve { previous: null } si nunca fue vendedor o si el perfil está activo.
    async findPreviousForReactivation(userId: string) {
        const seller = await this.prismaClient.seller.findFirst({
            where: { userId, deletedAt: { not: null } },
            select: {
                displayName: true,
                about: true,
                phone: true,
                whatsapp: true,
                website: true,
                country: true,
                location: true,
                deletedAt: true,
                subscription: { select: { cancelledAt: true } },
                _count: { select: { listings: true } },
            },
        })

        if (!seller) return { previous: null }

        const { deletedAt, subscription, _count, ...profile } = seller

        return {
            previous: {
                ...profile,
                cancelledAt: subscription?.cancelledAt ?? deletedAt,
                //- Cuántas publicaciones van a volver a mostrarse al reactivar
                listingsCount: _count.listings,
            },
        }
    }


    //* ----- Home del Dashboard ------
    //? ---- Resumen para el inicio del panel del vendedor
    async getSummary(sellerId: string) {
        const now = new Date()

        const [seller, byStatus, featuredUsed, subscription, totalInquiries, recent, unreadInquiries] = await Promise.all([
            this.prismaClient.seller.findUnique({
                where: { id: sellerId },
                select: { displayName: true, slug: true },
            }),
            this.prismaClient.listing.groupBy({
                by: ['status'],
                where: { sellerId },
                _count: { _all: true },
            }),
            this.prismaClient.listing.count({ where: { sellerId, featuredUntil: { gt: now } } }),
            this.prismaClient.subscription.findUnique({
                where: { sellerId },
                select: {
                    status: true,
                    expiresAt: true,
                    isComplimentary: true,
                    plan: { select: { name: true, maxListings: true, maxFeatured: true } },
                },
            }),
            this.prismaClient.inquiry.count({ where: { sellerId } }),
            this.prismaClient.inquiry.findMany({
                where: { sellerId },
                orderBy: { createdAt: 'desc' },
                take: 5,
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
            //- NUEVO: las que todavía no se marcaron como leídas
            this.prismaClient.inquiry.count({ where: { sellerId, readAt: null } }),
        ])
        if (!seller) throw new NotFoundException('Vendedor no encontrado')

        const count = (status: ListingStatus) => byStatus.find((row) => row.status === status)?._count._all ?? 0

        //- Un adelanto del mensaje: solo agrega "…" si realmente lo recortó
        const preview = (message: string, max = 160) =>
            message.length > max ? `${message.slice(0, max).trimEnd()}…` : message

        return {
            seller,
            listings: {
                total: byStatus.reduce((sum, row) => sum + row._count._all, 0),
                published: count(ListingStatus.PUBLISHED),
                draft: count(ListingStatus.DRAFT),
                paused: count(ListingStatus.PAUSED),
                closed: count(ListingStatus.SOLD) + count(ListingStatus.RENTED),
                expired: count(ListingStatus.EXPIRED),
            },
            featured: { used: featuredUsed, max: subscription?.plan.maxFeatured ?? 0 },
            subscription: subscription
                ? {
                    planName: subscription.plan.name,
                    maxListings: subscription.plan.maxListings,
                    isActive: isSubscriptionActive(subscription),
                    isComplimentary: subscription.isComplimentary,
                    expiresAt: subscription.expiresAt,
                }
                : null,
            inquiries: {
                total: totalInquiries,
                unread: unreadInquiries, // NUEVO
                recent: recent.map((inquiry) => ({ ...inquiry, message: preview(inquiry.message) })),
            },
        }
    }




    //* ================ Rutas publicas ================
    //- Perfil público: sin id, y con la cantidad de publicaciones que hoy se ven
    async findPublicBySlug(slug: string) {
        const seller = await this.prismaClient.seller.findFirst({
            where: { slug, deletedAt: null },
            select: {
                id: true,
                displayName: true,
                slug: true,
                avatarUrl: true,
                about: true,
                phone: true,
                whatsapp: true,
                website: true,
                country: true,
                location: true,
                createdAt: true,
            },
        })
        if (!seller) throw new NotFoundException('Vendedor no encontrado')

        const { id, ...profile } = seller

        const listingsCount = await this.prismaClient.listing.count({
            where: { AND: [{ sellerId: id }, publicListingWhere()] },
        })

        return { ...profile, listingsCount }
    }
}