import { UpdateListingDto } from './dto/update-listing.dto';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.module';
import { CreateListingDto } from './dto/create-listing.dto';
import { Currency, ListingOperation, ListingStatus, Prisma, RentPeriod, } from '@prisma/client';
import { randomSuffix, slugify } from 'src/common/utils/slug.util';
import { isSubscriptionActive } from 'src/common/utils/suscription.util';
import { ListingsQueryDto, ListingsSort } from './dto/listings-query.dto';
import { isFeatured, LISTING_CARD_SELECT, publicListingWhere, toListingCard } from 'src/common/utils/listing.util';
import { PrivateListingsDto } from './dto/private-listings.dto';
import { FEATURED_NO_EXPIRY, MAX_LISTING_IMAGES } from 'src/common/constants/listing.constants';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ListingImageInputDto } from './dto/listing-image-input.dto';

//* Ordenamiento
const ORDER_BY: Record<ListingsSort, Prisma.ListingOrderByWithRelationInput[]> = {
    newest: [{ createdAt: 'desc' }],
    price_asc: [{ price: 'asc' }, { createdAt: 'desc' }],
    price_desc: [{ price: 'desc' }, { createdAt: 'desc' }],
    year_asc: [{ year: 'asc' }, { createdAt: 'desc' }],
    year_desc: [{ year: 'desc' }, { createdAt: 'desc' }],
}

//*- Las destacadas primero (con fecha, de la más lejana a la más cercana; sin fecha, al final)
const FEATURED_FIRST: Prisma.ListingOrderByWithRelationInput = {
    featuredUntil: { sort: 'desc', nulls: 'last' },
}

//* Rangos de precios - { gte, lte } a partir de un desde/hasta opcionales. Si vienen al revés los intercambia (en vez de devolver 0 resultados)
function range(from?: number, to?: number) {
    if (from === undefined && to === undefined) return undefined
    const [min, max] = from !== undefined && to !== undefined && from > to ? [to, from] : [from, to]
    return {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
    }
}


function shuffle<T>(list: T[]): T[] {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

@Injectable()
export class ListingsService {

    constructor(
        private readonly prismaClient: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    //! ========== RUTAS PRIVADAS ==================================================================================================================================

    //? --- Crear una publicacion
    async create(sellerId: string, dto: CreateListingDto) {

        //- Las fotos no son columnas de Listing: se separan del resto
        const { newImages = [], ...data } = dto

        //- Suscripción (con el tope del plan) y cantidad ya publicada, en paralelo
        const [sub, total] = await Promise.all([
            //- Buscamos en la suscripcion el plan
            this.prismaClient.subscription.findUnique({
                where: { sellerId },
                select: {
                    status: true,
                    expiresAt: true,
                    plan: { select: { maxListings: true } },
                },
            }),
            //- Cantidad que emos publicado
            this.prismaClient.listing.count({ where: { sellerId } }),
        ])

        //- ¿Tiene la suscripción activa?
        if (!sub || !isSubscriptionActive(sub)) {
            throw new ForbiddenException('Tu suscripción no está activa')
        }

        //- Si ya tiene tantas como permite el plan, no puede subir más
        if (total >= sub.plan.maxListings) {
            throw new ForbiddenException('Alcanzaste el límite de publicaciones de tu plan')
        }

        this.assertValidImages(sellerId, newImages)

        try {
            const listing = await this.prismaClient.listing.create({
                data: {
                    ...data,
                    status: ListingStatus.PUBLISHED,
                    rentPeriod: data.operation === ListingOperation.RENT ? data.rentPeriod : null,
                    slug: `${slugify(data.title) || 'publicacion'}-${randomSuffix()}`,
                    sellerId,
                    images: {
                        create: newImages.map((image, position) => ({
                            publicId: image.publicId,
                            width: image.width,
                            height: image.height,
                            position,
                        })),
                    },
                },
            })

            //- Ya están en uso: se les quita la etiqueta para que la limpieza no las toque
            await this.cloudinary.untag(newImages.map((image) => image.publicId))

            return listing
        } catch (error) {
            if (this.isUniqueViolation(error)) throw new ConflictException('Una de las fotos ya está en uso')
            throw error
        }
    }

    //? --- Todas mis Publicaciiones del vendedor
    async myListings(sellerId: string, query: PrivateListingsDto) {

        const now = new Date()

        const { q, status, operation, sort } = query

        const page = query.page ?? 1
        const limit = query.limit ?? 8
        const skip = (page - 1) * limit

        //- Cada filtro es un elemento del AND: se combinan sin pisarse las claves
        const filters: Prisma.ListingWhereInput[] = [{ sellerId }]

        if (q) {
            filters.push({
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ],
            })
        }

        if (status?.length) filters.push({ status: { in: status } })
        if (operation?.length) filters.push({ operation: { in: operation } })

        const where: Prisma.ListingWhereInput = { AND: filters }

        const [items, total] = await Promise.all([
            this.prismaClient.listing.findMany({
                where,
                orderBy: ORDER_BY[sort ?? 'newest'],
                skip,
                take: limit,
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    operation: true,
                    rentPeriod: true,
                    condition: true,
                    currency: true,
                    price: true,
                    machineType: true,
                    year: true,
                    hours: true,
                    location: true,
                    status: true,
                    featuredUntil: true,
                    country: true,
                    createdAt: true,
                    images: {
                        select: { id: true, publicId: true, width: true, height: true },
                        orderBy: { position: 'asc' },
                    },
                },
            }),
            this.prismaClient.listing.count({ where }),
        ])

        return {
            items: items.map(({ featuredUntil, price, images, ...listing }) => {
                return {
                    ...listing,
                    price: Number(price),
                    featured: isFeatured(featuredUntil, now),
                    coverImageId: images[0]?.publicId ?? null,
                }
            }),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    }

    //? --- Destaca una publicacion (del dueño)
    async feature(sellerId: string, listingId: string) {
        const now = new Date()

        return this.prismaClient.$transaction(async (tx) => {

            //  FOR UPDATE le dice a Postgres: “traeme esta fila y bloqueala: 
            //  nadie más puede bloquearla o modificarla hasta que termine mi transacción”. 
            //  Si otra transacción intenta el mismo SELECT ... FOR UPDATE sobre esa misma fila, 
            //  espera a que la primera termine
            await tx.$queryRaw`SELECT id FROM "Seller" WHERE id = ${sellerId} FOR UPDATE`

            //- Buscamos la publicacion que vamos a actualizar
            const listing = await tx.listing.findFirst({
                where: { id: listingId, sellerId },
                select: { id: true, status: true, featuredUntil: true }
            })
            if (!listing) throw new NotFoundException('Publicación no encontrada')

            //- Si la publicacion no esta activa
            if (listing.status !== ListingStatus.PUBLISHED) {
                throw new BadRequestException('Solo se pueden destacar publicaciones activas')
            }

            //- Si ya esta destacada
            if (isFeatured(listing.featuredUntil, now)) {
                throw new ConflictException('La publicación ya está destacada')
            }

            //- Consultamos en la suscripcion del plan que estemos cuantas podemos destacar
            const sub = await tx.subscription.findUnique({
                where: { sellerId },
                select: {
                    status: true,
                    expiresAt: true,
                    plan: {
                        select: { maxFeatured: true }
                    }
                }
            })

            //- Corroboramos tener la suscripcion activa
            if (!sub || !isSubscriptionActive(sub)) {
                throw new ForbiddenException('Tu suscripción no está activa')
            }
            if (sub.plan.maxFeatured === 0) {
                throw new ForbiddenException('Tu plan no incluye publicaciones destacadas')
            }

            //- Tomamos la publicaciones destacadas activas
            const used = await tx.listing.count({
                where: { sellerId, featuredUntil: { gt: now } }
            })

            //- Si ya tenemos la cantidad limitada por el plan
            if (used >= sub.plan.maxFeatured) {
                throw new ForbiddenException(
                    `Alcanzaste el límite de ${sub.plan.maxFeatured} destacadas de tu plan`,
                )
            }

            //- Hasta que venza la suscripción (si no vence, sin fecha de corte)
            const featuredUntil = sub.expiresAt ?? FEATURED_NO_EXPIRY

            //- Actualizamos
            await tx.listing.update({
                where: { id: listing.id },
                data: { featuredUntil }
            })

            return { featuredUntil }
        })

    }

    //? --- Quitar el destacado: libera el cupo al instante
    async unfeature(sellerId: string, listingId: string) {
        const { count } = await this.prismaClient.listing.updateMany({
            where: {
                id: listingId,
                sellerId,
                featuredUntil: { not: null }
            },
            data: { featuredUntil: null }, //- Pasamos a nulo
        })
        if (count === 0) throw new NotFoundException('La publicación no existe o no estaba destacada')

        return { ok: true }
    }

    //? --- Tomamos Una publicación propia con todos los campos editables (para precargar el formulario)
    async myListing(sellerId: string, listingId: string) {
        const now = new Date()

        const listing = await this.prismaClient.listing.findFirst({
            where: { id: listingId, sellerId },
            select: {
                id: true, slug: true, title: true, operation: true, rentPeriod: true,
                condition: true, currency: true, price: true, machineType: true, year: true,
                hours: true, horsepower: true, location: true, country: true,
                description: true, status: true, featuredUntil: true, createdAt: true,
                images: {
                    select: { id: true, publicId: true, width: true, height: true },
                    orderBy: { position: 'asc' },
                },
            },
        })
        if (!listing) throw new NotFoundException('Publicacion no encontrada')

        const { featuredUntil, price, ...rest } = listing
        const featured = isFeatured(featuredUntil, now)

        return {
            ...rest,
            price: Number(price),
            featured,
            featuredUntil: featured ? featuredUntil : null
        }
    }

    //? --- Editamos una publicacion propia (datos y fotos)
    async update(sellerId: string, listingId: string, dto: UpdateListingDto) {
        const { newImages = [], removeImageIds = [], ...fields } = dto

        //- El where con sellerId evita editar publicaciones ajenas
        const current = await this.prismaClient.listing.findFirst({
            where: { id: listingId, sellerId },
            select: {
                operation: true,
                rentPeriod: true,
                status: true,
                images: { select: { id: true, publicId: true, position: true } },
            },
        })
        if (!current) throw new NotFoundException('Publicación no encontrada')

        //- Las fotos a quitar tienen que ser de esta publicación
        const toRemove = current.images.filter((image) => removeImageIds.includes(image.id))
        if (toRemove.length !== new Set(removeImageIds).size) {
            throw new BadRequestException('Alguna foto a quitar no pertenece a esta publicación')
        }

        if (current.images.length - toRemove.length + newImages.length > MAX_LISTING_IMAGES) {
            throw new BadRequestException(`Podés tener hasta ${MAX_LISTING_IMAGES} fotos`)
        }
        this.assertValidImages(sellerId, newImages)

        //- La regla "en alquiler hace falta el período" se valida sobre el estado final
        const operation = fields.operation ?? current.operation
        let rentPeriod: RentPeriod | null = null
        if (operation === ListingOperation.RENT) {
            rentPeriod = fields.rentPeriod ?? current.rentPeriod
        }

        //- Las fotos nuevas se agregan después de las que ya había
        const nextPosition = current.images.reduce((max, image) => Math.max(max, image.position), -1) + 1

        try {
            //- El slug no cambia aunque cambie el título: los links ya compartidos siguen funcionando
            const updated = await this.prismaClient.$transaction(async (tx) => {
                if (toRemove.length > 0) {
                    await tx.listingImage.deleteMany({
                        where: { id: { in: toRemove.map((image) => image.id) }, listingId },
                    })
                }

                return tx.listing.update({
                    where: { id: listingId },
                    data: {
                        ...fields,
                        operation,
                        rentPeriod,
                        ...(newImages.length > 0 && {
                            images: {
                                create: newImages.map((image, i) => ({
                                    publicId: image.publicId,
                                    width: image.width,
                                    height: image.height,
                                    position: nextPosition + i,
                                })),
                            },
                        }),
                    },
                    select: { id: true, slug: true },
                })
            })

            //- Fuera de la transacción: si Cloudinary falla, el cambio no se pierde (el error queda en el log)
            await Promise.all([
                this.cloudinary.destroy(toRemove.map((image) => image.publicId)),
                this.cloudinary.untag(newImages.map((image) => image.publicId)),
            ])

            return updated
        } catch (error) {
            if (this.isUniqueViolation(error)) throw new ConflictException('Una de las fotos ya está en uso')
            throw error
        }
    }

    //? --- Cambiar el estado (pausar, borrador, vendida, alquilada...)
    async changeStatus(sellerId: string, listingId: string, target: ListingStatus) {
        const listing = await this.prismaClient.listing.findFirst({
            where: { id: listingId, sellerId },
            select: { status: true, operation: true },
        })
        if (!listing) throw new NotFoundException('Publicación no encontrada')

        //- Idempotente: un doble clic no da error
        if (listing.status === target) return { status: target }

        if (target === ListingStatus.SOLD && listing.operation !== ListingOperation.SALE) {
            throw new BadRequestException('Solo una publicación de venta puede marcarse como vendida')
        }
        if (target === ListingStatus.RENTED && listing.operation !== ListingOperation.RENT) {
            throw new BadRequestException('Solo una publicación de alquiler puede marcarse como alquilada')
        }

        //- Publicar exige tener la suscripción vigente
        if (target === ListingStatus.PUBLISHED) {
            const sub = await this.prismaClient.subscription.findUnique({
                where: { sellerId },
                select: { status: true, expiresAt: true },
            })
            if (!sub || !isSubscriptionActive(sub)) {
                throw new ForbiddenException('Tu suscripción no está activa')
            }
        }

        //- Compare-and-set: si el estado cambió mientras tanto, no lo pisa
        const { count } = await this.prismaClient.listing.updateMany({
            where: { id: listingId, sellerId, status: listing.status },
            data: {
                status: target,
                //- Solo las publicadas pueden estar destacadas: al salir de PUBLISHED se libera el cupo
                ...(target !== ListingStatus.PUBLISHED ? { featuredUntil: null } : {}),
            },
        })
        if (count === 0) {
            throw new ConflictException('La publicación cambió mientras tanto. Recargá e intentá de nuevo.')
        }

        return { status: target }
    }


    //! --- Esta funcion no esta en uso aun, la vamos a usar cuando renovemos el plan con los pagos
    //- Al renovar: las destacadas vigentes siguen hasta el nuevo vencimiento
    async extendFeatured(
        sellerId: string,
        newExpiresAt: Date | null, //- fecha de vencimiento del plan
        tx: Prisma.TransactionClient = this.prismaClient,
    ) {
        await tx.listing.updateMany({
            where: { sellerId, featuredUntil: { gt: new Date() } },
            data: { featuredUntil: newExpiresAt ?? FEATURED_NO_EXPIRY },
        })
    }

    //! --- Firma para subir fotos directo a Cloudinary
    imageSignature(sellerId: string) {
        return this.cloudinary.signUpload(sellerId)
    }

    //! --- Las fotos tienen que ser de este vendedor y no repetirse
    private assertValidImages(sellerId: string, images: ListingImageInputDto[]) {
        if (new Set(images.map((image) => image.publicId)).size !== images.length) {
            throw new BadRequestException('Hay fotos repetidas')
        }
        for (const image of images) {
            if (!this.cloudinary.isValidUpload(sellerId, image)) {
                throw new BadRequestException('Una de las fotos no es válida. Volvé a subirla.')
            }
        }
    }

    private isUniqueViolation(error: unknown) {
        return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
    }


    //* ========== RUTAS PUBLICAS ==================================================================================================================================

    //? ---- lista de todas las maquinas
    async findPublic(query: ListingsQueryDto) {

        const {
            q, seller, operation, type, condition, country, yearFrom, yearTo,
            currency, minPrice, maxPrice, maxHours, minHorsepower, maxHorsepower, sort,
        } = query

        const page = query.page ?? 1
        const limit = query.limit ?? 8
        const skip = (page - 1) * limit

        const now = new Date()

        //- Cada filtro es un elemento del AND: se combinan sin pisarse las claves
        const filters: Prisma.ListingWhereInput[] = [publicListingWhere(now)] // ← oculta vendedores dados de baja

        //- Perfil público de un vendedor: solo sus publicaciones (sigue ocultando las de un vendedor dado de baja)
        if (seller) filters.push({ seller: { slug: seller } })

        if (q) {
            filters.push({
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ],
            })
        }
        if (operation?.length) filters.push({ operation: { in: operation } })
        if (type?.length) filters.push({ machineType: { in: type } })
        if (condition?.length) filters.push({ condition: { in: condition } })
        if (country) filters.push({ country })

        const year = range(yearFrom, yearTo)
        if (year) filters.push({ year })

        //- Los precios solo se comparan dentro de una misma moneda
        const price = range(minPrice, maxPrice)
        if (price) filters.push({ currency: currency ?? Currency.USD, price })

        //- Las máquinas sin horas cargadas (por ejemplo, nuevas) no se excluyen del "hasta X horas"
        if (maxHours !== undefined) {
            filters.push({ OR: [{ hours: null }, { hours: { lte: maxHours } }] })
        }

        const horsepower = range(minHorsepower, maxHorsepower)
        if (horsepower) filters.push({ horsepower })

        const where: Prisma.ListingWhereInput = { AND: filters }

        //- Con el orden por defecto, las destacadas van primero. Si el usuario ordena por precio o año, se respeta ese orden
        const orderBy =
            !sort || sort === 'newest' ? [FEATURED_FIRST, ...ORDER_BY.newest] : ORDER_BY[sort]


        const [items, total] = await Promise.all([
            this.prismaClient.listing.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: LISTING_CARD_SELECT,
            }),
            this.prismaClient.listing.count({ where }),
        ])

        return {
            //- featuredUntil no sale al público: se convierte en un booleano. Decimal se serializa como string: se pasa a número
            items: items.map(({ ...listing }) => toListingCard(listing, now)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

    }


    //? ---- Detalle público de una publicación
    async findPublicBySlug(slug: string) {
        const now = new Date()

        const listing = await this.prismaClient.listing.findFirst({
            where: { AND: [{ slug }, publicListingWhere()] },
            select: {
                slug: true,
                title: true,
                operation: true,
                rentPeriod: true,
                condition: true,
                currency: true,
                price: true,
                machineType: true,
                year: true,
                hours: true,
                horsepower: true,
                location: true,
                country: true,
                description: true,
                featuredUntil: true,
                createdAt: true,
                images: {
                    select: { publicId: true, width: true, height: true },
                    orderBy: { position: 'asc' },
                },
                seller: {
                    select: {
                        displayName: true,
                        slug: true,
                        avatarUrl: true,
                        phone: true,
                        whatsapp: true,
                        website: true,
                        country: true,
                        location: true,
                    },
                },
            },
        })

        //- Una publicación oculta responde igual que una inexistente: no se filtra que existe
        if (!listing) throw new NotFoundException('Publicación no encontrada')

        const { featuredUntil, price, ...rest } = listing

        return {
            ...rest,
            price: Number(price),
            featured: isFeatured(featuredUntil, now),
        }
    }


    //? ---- Destacadas para la home
    async findFeatured(limit = 8) {
        const now = new Date()
        const take = Math.min(12, Math.max(1, limit))

        //- Se piden más de las que se muestran y se mezclan: así los destacados rotan entre una actualización del caché y la siguiente
        const items = await this.prismaClient.listing.findMany({
            where: { AND: [publicListingWhere(now), { featuredUntil: { gt: now } }] },
            orderBy: { updatedAt: 'desc' },
            take: take * 3,
            select: LISTING_CARD_SELECT,
        })

        return shuffle(items)
            .slice(0, take)
            .map((listing) => toListingCard(listing, now))
    }


}

