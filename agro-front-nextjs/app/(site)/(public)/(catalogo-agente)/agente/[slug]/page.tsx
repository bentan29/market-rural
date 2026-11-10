import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductsGrid } from "@/features/components/products/ProductsGrid"
import { getPublicSeller } from "@/features/actions/public/seller/get-public-seller"
import { getListingsAction } from "@/features/actions/public/listings/get-listings.action"


type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

//- El título y la descripción salen del vendedor: es lo que Google muestra en los resultados
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const seller = await getPublicSeller(slug)

  if (!seller) return { title: "Vendedor no encontrado", robots: { index: false } }

  return {
    title: `${seller.displayName} | Maquinaria en venta y alquiler`,
    description:
      seller.about?.slice(0, 155) ??
      `Mirá las máquinas publicadas por ${seller.displayName} en ${seller.location}.`,
    //- Una sola URL canónica por vendedor, aunque lleguen visitas con ?page= u otros parámetros
    alternates: { canonical: `/vendedor/${seller.slug}` },
  }
}

async function SellerContent({ params, searchParams }: Props) {
    const { slug } = await params
    const sp = await searchParams
    const page = Math.max(1, Number(sp.page) || 1)

    const seller = await getPublicSeller(slug)
    if (!seller) notFound()

    const { items } = await getListingsAction({ seller: slug, page })

    return (
        <div className="flex flex-col gap-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{seller.displayName}</h1>
                <p className="text-sm text-muted-foreground">
                    {seller.location} · {seller.listingsCount} publicaciones
                </p>
                {seller.about && <p className="max-w-2xl text-sm">{seller.about}</p>}
            </header>

            <ProductsGrid listings={items} /> 
        </div>
    )
}

export default function SellerPage(props: Props) {
    return (
        <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
            <SellerContent {...props} />
        </Suspense>
    )
}