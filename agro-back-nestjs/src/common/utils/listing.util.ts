//- Una publicación se ve en público solo si su vendedor no está dado de baja y su plan está vigente.

import { ListingStatus, Prisma, SubscriptionStatus } from "@prisma/client";

//- Usarlo en TODA consulta pública: catálogo, detalle, perfil público, sitemap...
export const publicListingWhere = (now = new Date()): Prisma.ListingWhereInput => ({
    status: ListingStatus.PUBLISHED,
    seller: {
        deletedAt: null,
        subscription: {
            is: {
                status: SubscriptionStatus.ACTIVE,
                OR: [{expiresAt: null}, {expiresAt: {gt: now}}],
            },
        },
    },
})


//- Destacada = tiene fecha de vencimiento y todavía no pasó
export const isFeatured = (featuredUntil: Date | null, now = new Date()): boolean =>
    featuredUntil !== null && featuredUntil > now


//?- Los campos que muestran las tarjetas del catálogo, de la home y de favoritos
//?- `satisfies` conserva el tipo exacto de cada campo (a diferencia de anotarlo como Prisma.ListingSelect)
export const LISTING_CARD_SELECT = {
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
    horsepower: true,
    location: true,
    country: true,
    createdAt: true,
    featuredUntil: true,
    seller: { select: { displayName: true, slug: true } },
    images: { select: { publicId: true }, orderBy: { position: 'asc' }, take: 1 },
} satisfies Prisma.ListingSelect

type ListingCardRow = Prisma.ListingGetPayload<{ select: typeof LISTING_CARD_SELECT }>

//- Fila de la base -> lo que recibe el front: featuredUntil no sale (se vuelve un booleano) y Decimal pasa a número
export function toListingCard({ featuredUntil, price, images, ...listing }: ListingCardRow, now = new Date()) {
    return {
        ...listing,
        price: Number(price),
        featured: isFeatured(featuredUntil, now),
        coverImageId: images[0]?.publicId ?? null,
    }
}
