'use client'

import { useCatalogFilters } from "@/features/Nuqs/catalog/use-catalog-filters"
import { startTransition } from "react"

interface Props {
  totalPages: number
}


export const PaginationApp = ({ totalPages }: Props) => {

    if (totalPages <= 1) return null
    
    const [filter, setFilter] = useCatalogFilters(startTransition)

    return (
        <div>Pagination-App</div>
    )
}
