//- Una publicación se ve en público solo si su vendedor no está dado de baja y su plan está vigente.

import { Prisma, SubscriptionStatus } from "@prisma/client";

//- Usarlo en TODA consulta pública: catálogo, detalle, perfil público, sitemap...
export const publicListingWhere = (now = new Date()): Prisma.ListingWhereInput => ({
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