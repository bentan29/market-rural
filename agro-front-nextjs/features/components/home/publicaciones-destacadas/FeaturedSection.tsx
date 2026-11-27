import Link from "next/link"
import { connection } from "next/server"
import { Suspense } from "react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getFeaturedListings } from "@/features/actions/public/listings/get-featured-listings"
import { cn } from "@/lib/utils"
import { ListingCard } from "../../listings/ListingCard"

//- Ajustá la ruta si tu catálogo no está en /maquinarias
const CATALOG_HREF = "/maquinarias"

//- 8 = dos filas completas de 4 en escritorio (el backend admite hasta 12)
const FEATURED_COUNT = 8

const WRAPPER = "mx-auto w-full max-w-7xl px-6 py-14 md:px-16 md:py-20"

const seeAll =
    "inline-flex h-10 items-center gap-2 rounded-sm border border-teal-900/25 bg-background px-4 text-sm font-semibold text-teal-950 outline-none transition-colors hover:bg-teal-950/5 focus-visible:ring-2 focus-visible:ring-brand/40"

async function FeaturedItems() {

    //- Marca este componente como "se resuelve al abrir la página": sale del HTML que se arma al compilar
    //- y el build ya no necesita que el backend esté despierto. El caché de "minutos" sigue funcionando en ejecución
    await connection()

    try {
        const listings = await getFeaturedListings(FEATURED_COUNT)

        //- Sin destacadas no se muestra la sección (mejor nada que un hueco)
        if (listings.length === 0) return null

        return (
            <section aria-labelledby="featured-title" className="border-y border-teal-900/10 bg-muted/40">
                <div className={WRAPPER}>

                    <header className="mb-10 flex flex-col gap-6 border-b border-teal-900/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                                <span aria-hidden className="h-px w-10 bg-lime-500" />
                                Destacadas
                            </p>

                            <h2
                                id="featured-title"
                                className="text-balance text-3xl font-bold leading-[1.05] tracking-tight text-teal-950 md:text-4xl"
                            >
                                Maquinaria <span className="text-lime-700">destacada</span>
                            </h2>

                            {/* <p className="text-base text-muted-foreground">
                                Máquinas que sus vendedores destacaron para que lleguen primero a los compradores.
                            </p> */}
                        </div>

                        {/* En el celular el botón va al final de la lista */}
                        <Link href={CATALOG_HREF} className={cn(seeAll, "hidden shrink-0 sm:inline-flex")}>
                            Ver todo el catálogo
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.8} />
                        </Link>
                    </header>

                    {/* Celular: carrusel horizontal con imán. Desde sm: grilla.
                        lg:max-xl: con 3 columnas se ocultan la 7.ª y la 8.ª para no dejar la última fila a medias */}
                    <ul
                        className={cn(
                            "-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4",
                            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                            "sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0",
                            "lg:grid-cols-3 xl:grid-cols-4",
                            "lg:max-xl:[&>li:nth-child(n+7)]:hidden",
                        )}
                    >
                        {listings.map((listing) => (
                            <li
                                key={listing.id}
                                className="w-[82%] max-w-80 shrink-0 snap-start sm:w-auto sm:max-w-none [&>*]:h-full"
                            >
                                <ListingCard listing={listing} />
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 sm:hidden">
                        <Link href={CATALOG_HREF} className={cn(seeAll, "w-full justify-center")}>
                            Ver todo el catálogo
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.8} />
                        </Link>
                    </div>
                </div>
            </section>
        )
    } catch (error) {
        console.error("FeaturedItems:", error)
        return null
    }
}

//- Misma forma que la sección real: la página no salta cuando llegan los datos
function FeaturedSkeleton() {
    return (
        <div aria-hidden className="border-y border-teal-900/10 bg-muted/40">
            <div className={WRAPPER}>
                <div className="mb-10 space-y-4 border-b border-teal-900/10 pb-8">
                    <div className="h-3 w-28 animate-pulse rounded-xs bg-muted" />
                    <div className="h-10 w-72 animate-pulse rounded-sm bg-muted" />
                    <div className="h-5 w-full max-w-md animate-pulse rounded-sm bg-muted" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-sm border border-teal-900/10 bg-card">
                            <div className="aspect-4/3 animate-pulse bg-muted" />
                            <div className="space-y-3 p-4">
                                <div className="h-3 w-24 animate-pulse rounded-xs bg-muted" />
                                <div className="h-5 w-full animate-pulse rounded-xs bg-muted" />
                                <div className="h-5 w-2/3 animate-pulse rounded-xs bg-muted" />
                                <div className="h-8 w-32 animate-pulse rounded-xs bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function FeaturedSection() {
    return (
        <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedItems />
        </Suspense>
    )
}