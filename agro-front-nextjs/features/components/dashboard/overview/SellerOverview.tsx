import Link from "next/link"
import { redirect } from "next/navigation"
import { formatDate } from "../listings/table/listing-format"
import { Notice, OverviewPanel, StatCard, primaryLink, secondaryLink } from "./overview-ui"
import { getSellerSummary } from "@/features/actions/private/seller/get-seller-summary"

const DAY_MS = 24 * 60 * 60 * 1000
const EXPIRY_WARNING_DAYS = 14

//- Cuando exista la bandeja de mensajes, poné acá su ruta (por ejemplo "/dashboard/mensajes")
const MESSAGES_HREF: string | null = "/dashboard/consultas?tab=recibidas"

export async function SellerOverview() {
    const result = await getSellerSummary()

    if (!result.ok) {
        if (result.status === 401) redirect("/login?next=/dashboard")
        return <Notice tone="danger">{result.message}</Notice>
    }

    const { seller, listings, featured, subscription, inquiries } = result.summary

    const maxListings = subscription?.maxListings ?? 0
    const isActive = subscription?.isActive ?? false
    const canPublish = isActive && listings.total < maxListings
    const unpublished = listings.paused + listings.draft

    //- Se calcula después de esperar los datos: así la fecha no obliga a renderizar de nuevo
    const daysLeft = subscription?.expiresAt
        ? Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / DAY_MS)
        : null

    return (
        <div className="flex flex-col gap-8">

            {/* Alertas del plan */}
            {!subscription || !isActive ? (
                <Notice tone="danger">
                    Tu suscripción no está activa: tus publicaciones no se muestran al público.{" "}
                    <Link href="/dashboard/suscripcion" className="font-semibold underline underline-offset-4">
                        Ver mi suscripción
                    </Link>
                </Notice>
            ) : daysLeft !== null && daysLeft <= EXPIRY_WARNING_DAYS ? (
                <Notice tone="warning">
                    {daysLeft <= 0 ? "Tu plan vence hoy." : `Tu plan vence en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}.`}{" "}
                    <Link href="/dashboard/suscripcion" className="font-semibold underline underline-offset-4">
                        Ver mi suscripción
                    </Link>
                </Notice>
            ) : null}

            {/* Primera vez: invitar a publicar */}
            {listings.total === 0 && canPublish && (
                <div className="flex flex-col gap-4 rounded-sm bg-teal-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-400">Empezá acá</p>
                        <p className="text-xl font-bold">Publicá tu primera máquina</p>
                        <p className="text-sm text-white/70">Tarda unos minutos y queda visible en el catálogo enseguida.</p>
                    </div>
                    <Link href="/dashboard/publicaciones/crear" className={primaryLink}>
                        Publicar ahora
                    </Link>
                </div>
            )}

            {/* Indicadores */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="Publicaciones"
                    value={listings.total}
                    unit={maxListings > 0 ? `de ${maxListings}` : undefined}
                    progress={maxListings > 0 ? { value: listings.total, max: maxListings } : undefined}
                    hint={
                        <>
                            {listings.published} publicadas
                            {unpublished > 0 && ` · ${unpublished} sin publicar`}
                        </>
                    }
                />

                <StatCard
                    label="Destacadas"
                    value={featured.used}
                    unit={featured.max > 0 ? `de ${featured.max}` : undefined}
                    progress={featured.max > 0 ? { value: featured.used, max: featured.max } : undefined}
                    hint={featured.max > 0 ? "Aparecen primero en el catálogo" : "Tu plan no incluye destacadas"}
                />

                <StatCard
                    label="Consultas recibidas"
                    value={inquiries.total}
                    hint="También te llegan por email y WhatsApp"
                />

                <StatCard
                    label="Tu plan"
                    value={subscription?.planName ?? "—"}
                    hint={
                        !subscription ? "Sin suscripción"
                            : subscription.expiresAt ? `Vence el ${formatDate(subscription.expiresAt)}`
                                : subscription.isComplimentary ? "Cortesía, sin vencimiento"
                                    : "Sin vencimiento"
                    }
                />

                <StatCard
                    label="Consultas sin leer"
                    value={inquiries.unread}
                    hint={`${inquiries.total} recibidas en total`}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">

                {/* Últimas consultas */}
                <OverviewPanel
                    title="Últimas consultas"
                    action={
                        MESSAGES_HREF && (
                            <Link href={MESSAGES_HREF} className="text-xs font-medium underline-offset-4 hover:underline">
                                Ver todas
                            </Link>
                        )
                    }
                >
                    {inquiries.recent.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Todavía no recibiste consultas. Cuando alguien te escriba desde una publicación, aparece acá.
                        </p>
                    ) : (
                        <ul className="divide-y divide-teal-900/10">
                            {inquiries.recent.map((inquiry) => (
                                <li key={inquiry.id} className="space-y-1.5 py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="truncate text-sm font-semibold text-teal-950">{inquiry.name}</p>
                                        <time dateTime={inquiry.createdAt} className="shrink-0 text-xs text-muted-foreground">
                                            {formatDate(inquiry.createdAt)}
                                        </time>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        por{" "}
                                        <Link
                                            href={`/maquinaria/${inquiry.listing.slug}`}
                                            className="font-medium text-foreground underline-offset-4 hover:underline"
                                        >
                                            {inquiry.listing.title}
                                        </Link>
                                    </p>

                                    <p className="line-clamp-2 text-sm text-foreground/80">{inquiry.message}</p>

                                    <a
                                        href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.listing.title}`)}`}
                                        className="inline-block pt-1 text-xs font-semibold text-teal-900 underline-offset-4 hover:underline"
                                    >
                                        Responder por email
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </OverviewPanel>

                {/* Atajos */}
                <OverviewPanel title="Atajos">
                    <div className="flex flex-col gap-3">
                        {canPublish ? (
                            <Link href="/dashboard/publicaciones/crear" className={primaryLink}>
                                Publicar una máquina
                            </Link>
                        ) : (
                            <p className="rounded-sm bg-muted p-3 text-sm text-muted-foreground">
                                {isActive
                                    ? "Alcanzaste el límite de publicaciones de tu plan."
                                    : "Reactivá tu suscripción para publicar."}
                            </p>
                        )}

                        <Link href="/dashboard/publicaciones" className={secondaryLink}>
                            Mis publicaciones
                        </Link>
                        <Link href="/dashboard/suscripcion" className={secondaryLink}>
                            Mi suscripción
                        </Link>
                        <Link href={`/agente/${seller.slug}`} className={secondaryLink}>
                            Mi página pública
                        </Link>
                    </div>
                </OverviewPanel>
            </div>
        </div>
    )
}