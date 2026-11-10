import type { Metadata } from "next"
import { CatalogShell } from "@/features/components/catalog/CatalogShell"

export const metadata: Metadata = {
    title: "Maquinaria agrícola en venta y alquiler",
    description:
        "Tractores, cosechadoras y equipos agrícolas publicados por productores y empresas de toda la región.",
    //- Todas las combinaciones de filtros apuntan a esta URL: no compiten entre sí en Google
    alternates: { canonical: "/catalogo" },
}

export default function CatalogoPage({ searchParams }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {

  return <CatalogShell country={null} searchParams={searchParams} />
  
}