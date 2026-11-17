import Link from "next/link"
import { Suspense } from "react"
import { getFeaturedListings } from "@/features/actions/public/listings/get-featured-listings"
import { ListingsGrid } from "../../listings/ListingsGrid"

async function FeaturedItems() {
    try {
        const listings = await getFeaturedListings(8)

        //- Sin destacadas no se muestra la sección (mejor nada que un hueco)
        if (listings.length === 0) return null

        return (
            <section aria-labelledby="featured-title" className="mx-auto w-full max-w-7xl px-6 py-14 md:px-16">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <span className="block w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                            Selección
                        </span>
                        <h2 id="featured-title" className="text-balance text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
                            Máquinas <span className="text-lime-600">destacadas</span>
                        </h2>
                    </div>

                    <Link
                        href="/catalogo"
                        className="text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:underline"
                    >
                        Ver todo el catálogo →
                    </Link>
                </div>

                <ListingsGrid listings={listings} />
            </section>
        )
    } catch (error) {
        console.error("FeaturedItems:", error)
        return null
    }
}

function FeaturedSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl px-6 py-14 md:px-16">
            <div className="mb-8 h-16 w-72 animate-pulse rounded-sm bg-muted" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-96 animate-pulse rounded-sm bg-muted" />
                ))}
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