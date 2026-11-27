import { Suspense } from "react"
import { SellerOverview } from "@/features/components/dashboard/overview/SellerOverview"
import { UserOverview } from "@/features/components/dashboard/overview/UserOverview"
import { OverviewSkeleton } from "@/features/components/dashboard/overview/overview-ui"
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader"
import { requireUser } from "@/lib/auth/get-user"

//- Lee la sesión (cookies): por eso va dentro de un Suspense
async function DashboardContent() {
    const user = await requireUser()

    const firstName = (user.fullName ?? user.email).trim().split(/\s+/)[0]
    const isSeller = user.role === "SELLER"

    return (
        <div className="flex flex-col gap-8">
            <DashboardPageHeader
                title={`Hola, ${firstName}`}
                subtitle={isSeller ? "Este es el resumen de tu actividad como vendedor" : "Tu cuenta y tus máquinas guardadas"}
            />

            {
                isSeller
                    ? <SellerOverview />
                    : <UserOverview canBecomeSeller={user.role === "USER"} />
            }
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<OverviewSkeleton />}>
            <DashboardContent />
        </Suspense>
    )
}