import Link from "next/link"
import { redirect } from "next/navigation"
import { Notice, OverviewPanel, primaryLink, secondaryLink } from "./overview-ui"
import { getMyFavorites } from "@/features/actions/private/favorites/get-my-favorites"
import { ListingsGrid } from "../../listings/ListingsGrid"

//- Ajustá estas rutas a las de tu menú lateral
const FAVORITES_HREF = "/dashboard/favoritos"
const BECOME_SELLER_HREF = "/dashboard/registro-vendedor"

const SELLER_BENEFITS = [
    "Publicá en venta o alquiler",
    "Llegá a compradores de toda la región",
    "Gestioná todo desde tu panel",
] as const

export async function UserOverview({ canBecomeSeller }: { canBecomeSeller: boolean }) {
    const result = await getMyFavorites(4)

    if (!result.ok && result.status === 401) redirect("/login?next=/dashboard")

    return (
        <div className="flex flex-col gap-8">

            {canBecomeSeller && (
                <section className="grid gap-6 rounded-sm bg-teal-950 p-6 text-white md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
                    <div className="space-y-4">
                        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-400">
                            <span aria-hidden className="h-px w-8 bg-lime-400" />
                            Para vendedores
                        </p>

                        <h2 className="text-2xl leading-tight font-bold md:text-3xl">
                            Vendé o alquilá <span className="text-lime-400">tu maquinaria.</span>
                        </h2>

                        <ul className="space-y-1.5 text-sm text-white/75">
                            {SELLER_BENEFITS.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-2">
                                    <span aria-hidden className="size-1.5 rounded-full bg-lime-400" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link href={BECOME_SELLER_HREF} className={`${primaryLink} h-12 px-6 text-base`}>
                        Registrarme como vendedor
                    </Link>
                </section>
            )}

            <OverviewPanel
                title={result.ok && result.total > 0 ? `Mis favoritos (${result.total})` : "Mis favoritos"}
                action={
                    result.ok && result.total > 0 ? (
                        <Link href={FAVORITES_HREF} className="text-xs font-medium underline-offset-4 hover:underline">
                            Ver todos
                        </Link>
                    ) : undefined
                }
            >
                {!result.ok ? (
                    <Notice tone="danger">{result.message}</Notice>
                ) : result.items.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Todavía no guardaste ninguna máquina. Tocá el corazón de una publicación para tenerla a mano.
                        </p>
                        <Link href="/catalogo" className={secondaryLink}>
                            Explorar el catálogo
                        </Link>
                    </div>
                ) : (
                    <ListingsGrid listings={result.items} />
                )}
            </OverviewPanel>
        </div>
    )
}