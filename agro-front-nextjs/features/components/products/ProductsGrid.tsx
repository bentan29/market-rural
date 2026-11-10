import type { ListingType } from "@/lib/types/listing.type"
import { ProductCard } from "./ProductCard"

interface Props {
  listings: ListingType[]
}

export const ProductsGrid = ({ listings }: Props) => {

  if (listings.length === 0) {
    return (
      <p className="rounded-sm border border-dashed p-8 text-center text-sm text-muted-foreground">
        Todavía no hay publicaciones para mostrar.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}