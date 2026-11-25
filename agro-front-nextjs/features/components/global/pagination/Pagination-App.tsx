'use client'

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useCatalogFilters } from "@/features/Nuqs/catalog/use-catalog-filters"
import { startTransition } from "react"

interface Props {
  totalPages: number
}


export const PaginationApp = ({ totalPages }: Props) => {

    if (totalPages <= 1) return null
    
    const [filter, setFilter] = useCatalogFilters(startTransition)

    //? -----------
    const getPages = () => {
      const pages: (number | string)[] = []
      const maxVisibles = 6
      
      if(totalPages <= maxVisibles) {
        return Array.from({length: totalPages}, (_, i) => i + 1)
      }

      pages.push(1)

      const start = Math.max(2, filter.page - 1)
      const end = Math.min(totalPages - 1, filter.page + 1)

      if (start > 2) pages.push("...")
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < totalPages - 1) pages.push("...")
      pages.push(totalPages)

      return pages
    }

   
    const pages = getPages()

    return (
      <Pagination className="mt-10">
        <PaginationContent>

          <PaginationItem>
            {filter.page > 1
                ? <PaginationPrevious onClick={() => setFilter({page: filter.page - 1})} className="cursor-pointer" />
                : <PaginationPrevious className="opacity-50 pointer-events-none" />
            }
          </PaginationItem>

          {pages.map((page, idx) => (
            <PaginationItem key={idx}>
                {page === "..."
                    ? <PaginationEllipsis />
                    : <PaginationLink
                        onClick={() => setFilter({page: page as number})}
                        isActive={page === filter.page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                }
            </PaginationItem>
          ))}

          <PaginationItem>
              {filter.page < totalPages
                  ? <PaginationNext onClick={() => setFilter({page: filter.page + 1})} className="cursor-pointer" />
                  : <PaginationNext className="opacity-50 pointer-events-none" />
              }
          </PaginationItem>

        </PaginationContent>
      </Pagination>
    )
}
