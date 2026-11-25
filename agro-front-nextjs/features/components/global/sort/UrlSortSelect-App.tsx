"use client"

import { Suspense, useTransition } from "react"
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs"
import { cn } from "@/lib/utils"
import { DEFAULT_LISTING_SORT, LISTING_SORTS, ListingSort, SORT_LABEL } from "@/features/constants/sort/sorts.constant"
import { SortSelectProps, SortSelect } from "./Sort"


//- Las mismas claves de la URL que usan el catálogo y el panel (sort y page): todos leen lo mismo
const sortParsers = {
  sort: parseAsStringLiteral(LISTING_SORTS).withDefault(DEFAULT_LISTING_SORT),
  page: parseAsInteger.withDefault(1),
}

type Props = Pick<SortSelectProps<ListingSort>, "label" | "tone" | "disabled" | "className"> & {
  /** Para mostrar solo algunos órdenes (por defecto, todos) */
  options?: readonly ListingSort[]
}

function UrlSortSelectInner({ options = LISTING_SORTS, ...rest }: Props) {
  const [isPending, startTransition] = useTransition()

  const [{ sort }, setParams] = useQueryStates(sortParsers, {
    shallow: false, // vuelve a ejecutar la página del servidor
    clearOnDefault: true, // el orden por defecto no ensucia la URL
    startTransition,
  })

  //- Si la URL trae un orden que esta lista no ofrece, se muestra el primero en vez de un <select> en blanco
  const value = options.includes(sort) ? sort : options[0]

  return (
    <SortSelect
      {...rest}
      value={value}
      options={options}
      labels={SORT_LABEL}
      pending={isPending}
      //- Al cambiar el orden se vuelve a la página 1: si no, podés quedar en una página que ya no existe
      onChange={(next) => setParams({ sort: next, page: 1 })}
    />
  )
}

//- Los hooks de nuqs necesitan un Suspense: ya viene incluido, así que se usa en cualquier página sin acordarse
export function UrlSortSelect(props: Props) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden
          className={cn("h-9 w-64 animate-pulse rounded-sm", props.tone === "dark" ? "bg-white/10" : "bg-muted")}
        />
      }
    >
      <UrlSortSelectInner {...props} />
    </Suspense>
  )
}