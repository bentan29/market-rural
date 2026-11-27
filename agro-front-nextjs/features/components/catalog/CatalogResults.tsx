import Link from "next/link"
import { createSearchParamsCache } from "nuqs/server"
import { getListingsAction } from "@/features/actions/public/listings/get-listings.action"
import { MACHINE_GROUPS, type MachineItem } from "@/features/constants/products/type-machine.constant"
import { catalogParsers } from "@/features/Nuqs/catalog/catalog-search-params"
import { ListingsGrid } from "../listings/ListingsGrid"
import { PaginationApp } from "../global/pagination/Pagination-App"
import { UrlSortSelect } from "../global/sort/UrlSortSelect-App"

const cache = createSearchParamsCache(catalogParsers)

const MACHINE_VALUES = new Set<string>(
  MACHINE_GROUPS.flatMap<MachineItem>((group) => group.items).map((item) => item.value),
)

const MAX_YEAR = new Date().getFullYear() + 1

const inRange = (value: number | null, min: number, max: number) =>
  value !== null && value >= min && value <= max ? value : null

type Parsed = Awaited<ReturnType<typeof cache.parse>>

//- Una URL escrita a mano no debe romper el catálogo: lo que está fuera de rango se descarta antes de llegar a Nest
function sanitize(f: Parsed) {
  return {
    ...f,
    q: f.q.slice(0, 80),
    type: f.type.filter((value) => MACHINE_VALUES.has(value)),
    yearFrom: inRange(f.yearFrom, 1900, MAX_YEAR),
    yearTo: inRange(f.yearTo, 1900, MAX_YEAR),
    minPrice: inRange(f.minPrice, 0, 9_999_999_999),
    maxPrice: inRange(f.maxPrice, 0, 9_999_999_999),
    maxHours: inRange(f.maxHours, 0, 200_000),
    minHorsepower: inRange(f.minHorsepower, 1, 5_000),
    maxHorsepower: inRange(f.maxHorsepower, 1, 5_000),
    page: Math.min(1000, Math.max(1, f.page)),
  }
}

type Props = {
  /** Qué se está mirando: un país (código ISO) o las publicaciones de un vendedor (su slug) */
  scope: { country?: string | null; seller?: string }
  /** Ruta sin filtros, para el botón "Quitar filtros" */
  basePath: string
  /** Complemento del contador: " en Uruguay", " de este vendedor"... */
  countLabel?: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CatalogResults({ scope, basePath, countLabel = "", searchParams }: Props) {

  const filters = sanitize(await cache.parse(searchParams))

  const hasFilters =
    filters.q !== "" ||
    filters.operation.length > 0 ||
    filters.type.length > 0 ||
    filters.condition.length > 0 ||
    [
      filters.yearFrom, filters.yearTo, filters.minPrice, filters.maxPrice,
      filters.maxHours, filters.minHorsepower, filters.maxHorsepower,
    ].some((value) => value !== null)

  try {
    const { items, total, totalPages } = await getListingsAction({
      ...filters,
      country: scope.country ?? null,
      seller: scope.seller ?? null,
    })

    if (items.length === 0) {
      return (
        <div className="rounded-sm border border-dashed p-10 text-center">
          <p className="font-medium">
            {hasFilters ? "No hay máquinas con estos filtros" : "Todavía no hay publicaciones para mostrar"}
          </p>
          {hasFilters && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">Probá con otros o quitá los filtros.</p>
              <Link
                href={basePath}
                className="mt-4 inline-flex h-9 items-center rounded-sm border px-4 text-sm font-medium hover:bg-muted"
              >
                Quitar filtros
              </Link>
            </>
          )}
        </div>
      )
    }

    return (
      <div className="mx-auto w-full max-w-7xl pb-8 ">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "máquina" : "máquinas"}
            {countLabel}
          </p>

          <UrlSortSelect />
        </div>

        <ListingsGrid listings={items} />

        <PaginationApp totalPages={totalPages} />

      </div>
    )
  } catch (error) {
    console.error("CatalogResults:", error)

    return (
      <p
        role="alert"
        className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      >
        No pudimos cargar las publicaciones. Probá de nuevo en unos minutos.
      </p>
    )
  }
}