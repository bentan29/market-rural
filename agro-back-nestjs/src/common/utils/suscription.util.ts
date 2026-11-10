import { SubscriptionStatus } from '@prisma/client'

//- Una suscripción vale si está ACTIVE y no pasó su vencimiento (sin cron, status solo no alcanza)
export function isSubscriptionActive(
    sub: { status: SubscriptionStatus; expiresAt: Date | null },
    now = new Date(),
): boolean {
    return sub.status === SubscriptionStatus.ACTIVE && (!sub.expiresAt || sub.expiresAt > now)
}