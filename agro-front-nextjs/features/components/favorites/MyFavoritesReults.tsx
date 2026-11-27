import Link from "next/link"
import { redirect } from "next/navigation"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import { getMyFavorites } from "@/features/actions/private/favorites/get-my-favorites"
import { PaginationApp } from "../global/pagination/Pagination-App"
import { ListingsGrid } from "../listings/ListingsGrid"

//- Ajustá la ruta a la de tu página de favoritos
const FAVORITES_PATH = "/dashboard/favoritos"
const PAGE_SIZE = 8

const cache = createSearchParamsCache({ page: parseAsInteger.withDefault(1) })

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function MyFavoritesResults({ searchParams }: Props) {
    const { page: requested } = await cache.parse(searchParams)

    //- Una URL escrita a mano (?page=-3, ?page=99999999) no debe romper nada
    const page = Math.min(10_000, Math.max(1, requested))

    const result = await getMyFavorites(PAGE_SIZE, page)

    if (!result.ok) {
        if (result.status === 401) redirect(`/login?next=${FAVORITES_PATH}`)

        return (
            <p
                role="alert"
                className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
                {result.message}
            </p>
        )
    }

    if (result.total === 0) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed p-10 text-center">
                <p className="max-w-sm text-sm text-muted-foreground">
                    Todavía no guardaste ninguna máquina. Tocá el corazón de una publicación para tenerla a mano.
                </p>
                <Link
                    href="/catalogo"
                    className="inline-flex h-10 items-center rounded-sm border border-teal-900/25 px-5 text-sm font-semibold text-teal-950 hover:bg-teal-950/5"
                >
                    Explorar el catálogo
                </Link>
            </div>
        )
    }

    //- Una página fuera de rango (por ejemplo, después de quitar favoritos) vuelve a la última que existe
    if (result.items.length === 0) {
        redirect(`${FAVORITES_PATH}?page=${result.totalPages}`)
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                {result.total} {result.total === 1 ? "máquina guardada" : "máquinas guardadas"}
            </p>

            <ListingsGrid listings={result.items} />

            {result.totalPages > 1 && <PaginationApp totalPages={result.totalPages} />}
        </div>
    )
}