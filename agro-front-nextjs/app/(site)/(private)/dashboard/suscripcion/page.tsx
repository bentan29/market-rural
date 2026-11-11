// export const dynamic = 'force-dynamic';

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader"
import { CancelSuscriptionbutton } from "@/features/components/suscription/CancelSuscription-button"
import { getMySuscriptionAction } from "@/features/actions/private/suscription/get-my-suscription.action"

//- Todo lo que depende de los datos va adentro de Suspense; el resto se prerenderiza
async function SuscriptionContent() {

    const result = await getMySuscriptionAction()
    // console.log({result})

    if (!result.ok) {
        //- Sesión vencida: al login y de vuelta acá
        if (result.status === 401) redirect("/login?next=/dashboard/suscripcion")
        return (
            <p
                role="alert"
                className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
                {result.message}
            </p>
        )
    }

    const { suscription } = result

    return (
        <section className="space-y-6">
            {/* Ajustá los campos a tu SuscriptionType */}
            <dl className="grid gap-4 rounded-sm border bg-card p-6 sm:grid-cols-3">
                <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Plan</dt>
                    <dd className="mt-1 font-semibold">{suscription.plan.name}</dd>
                </div>
                <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Estado</dt>
                    <dd className="mt-1 font-semibold">{suscription.status}</dd>
                </div>
                <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Publicaciones</dt>
                    <dd className="mt-1 font-semibold">hasta {suscription.plan.maxListings}</dd>
                </div>
                <dd className="mt-1 font-semibold">
                    {suscription.usage.listings.used} de {suscription.usage.listings.max}
                </dd>
            </dl>

            <CancelSuscriptionbutton />
        </section>
    )
}

export default function SuscriptionPage() {
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Sobre mi plan"
                subtitle="Podés cambiar o cancelar el plan si lo deseas"
            />

            <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
                <SuscriptionContent />
            </Suspense>
        </div>
    )
}