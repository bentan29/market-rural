import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { AgentHeader } from "@/features/components/agent/AgentHeader"
import { CatalogResults } from "@/features/components/catalog/CatalogResults"
import { getPublicSeller } from "@/features/actions/public/seller/get-public-seller"


//- Mismo formato que genera el backend: evita pedirle a Nest un slug imposible
const SLUG_REGEX = /^[a-z0-9-]{1,80}$/

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params
  const seller = SLUG_REGEX.test(slug) ? await getPublicSeller(slug) : null

  if (!seller) return { title: "Agente no encontrado", robots: { index: false } }

  return {
    title: `${seller.displayName} | Maquinaria en venta y alquiler`,
    description:
      seller.about?.replace(/\s+/g, " ").slice(0, 155) ??
      `Mirá las máquinas publicadas por ${seller.displayName} en ${seller.location}.`,
    //- Una sola URL canónica por agente, aunque lleguen visitas con filtros o ?page=
    alternates: { canonical: `/agente/${seller.slug}` },
  }
}

async function AgentContent({ params, searchParams }: Props) {
  
  const { slug } = await params
  if (!SLUG_REGEX.test(slug)) notFound()

  const seller = await getPublicSeller(slug)
  if (!seller) notFound()

  return (
    <div className="space-y-8">
      <AgentHeader seller={seller} />

      <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
        <CatalogResults
          scope={{ seller: slug }}
          basePath={`/agente/${slug}`}
          countLabel=" de este agente"
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}

export default function AgentePage(props: Props) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
      <AgentContent {...props} />
    </Suspense>
  )
}