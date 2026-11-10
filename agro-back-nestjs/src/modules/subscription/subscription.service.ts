
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SubscriptionStatus } from '@prisma/client';
import { isSubscriptionActive } from 'src/common/utils/suscription.util';
import { PrismaService } from 'src/core/prisma/prisma.module';

@Injectable()
export class SubscriptionService {

    constructor(private readonly prismaClient: PrismaService){}

    //? ----- Tomamos nuestra suscripcion
    async mySuscription(sellerId: string) {
        const [subscription, listingsUsed] = await Promise.all([
            this.prismaClient.subscription.findUnique({
                where: { sellerId },
                select: {
                    status: true,
                    startedAt: true,
                    expiresAt: true,
                    isComplimentary: true,
                    plan: {
                        select: {
                            name: true,
                            price: true,
                            currency: true,
                            maxListings: true,
                            maxFeatured: true,
                            features: true,
                        },
                    },
                },
            }),
            this.prismaClient.listing.count({ where: { sellerId } }),
        ])

        if (!subscription) throw new NotFoundException('No tenés ningún plan activado')

        const { plan, ...rest } = subscription

        return {
            ...rest,
            isActive: isSubscriptionActive(rest),
            //- Prisma serializa Decimal como string: lo pasamos a número para mostrarlo
            plan: { ...plan, price: Number(plan.price) },
            usage: {
                listings: { used: listingsUsed, max: plan.maxListings },
            },
        }
    }


    //? ----- Cancelar suscripción = dar de baja al vendedor (soft delete)
    //- Recibe el sellerId que dejó el guard, nunca un id del cliente (así nadie cancela planes ajenos)
    async cancelSuscription(sellerId: string) {
        const now = new Date()

        return this.prismaClient.$transaction(async (tx) => {

            //- "Reclamo" atómico: solo una request puede dar de baja (un doble clic no repite nada)
            const { count } = await tx.seller.updateMany({
                where: { id: sellerId, deletedAt: null },
                data: { deletedAt: now },
            })
            if (count === 0) throw new ConflictException('Tu perfil de vendedor ya está dado de baja')

            const seller = await tx.seller.findUniqueOrThrow({
                where: { id: sellerId },
                select: { userId: true },
            })

            //- Cancelamos suscripcion
            await tx.subscription.updateMany({
                where: { sellerId },
                data: { 
                    status: SubscriptionStatus.CANCELLED, 
                    cancelledAt: now 
                },
            })

            //- Pasamos el ROLE de SELLER a USER
            await tx.user.updateMany({
                where: { id: seller.userId, role: Role.SELLER },
                data: { role: Role.USER },
            })

            //- Desmarcamos todas las publicaciones destacadas
            //- Sin suscripción no hay destacadas: si vuelve, empieza de cero con su plan
            await tx.listing.updateMany({
                where: { sellerId },
                data: { featuredUntil: null },
            })

            return { cancelledAt: now }
        })
    }

}
