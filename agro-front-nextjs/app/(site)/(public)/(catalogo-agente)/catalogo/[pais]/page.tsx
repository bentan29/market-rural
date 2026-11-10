import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CatalogShell } from "@/features/components/catalog/CatalogShell"
import { CATALOG_COUNTRIES, COUNTRY_BY_SLUG } from "@/features/constants/catalog/countries"

type Props = {
    params: Promise<{ pais: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
    return CATALOG_COUNTRIES.map((country) => ({ pais: country.slug }))
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
    const country = COUNTRY_BY_SLUG[(await params).pais]
    if (!country) return { title: "Catálogo", robots: { index: false } }

    return {
        title: `Maquinaria agrícola en ${country.name}`,
        description: `Tractores, cosechadoras y equipos agrícolas en venta y alquiler en ${country.name}.`,
        alternates: { canonical: `/catalogo/${country.slug}` },
    }
}

async function CountryCatalog({ params, searchParams }: Props) {
    const country = COUNTRY_BY_SLUG[(await params).pais]
    if (!country) notFound()

    return <CatalogShell country={country} searchParams={searchParams} />
}

export default function CatalogoPaisPage(props: Props) {
    return (
        <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
            <CountryCatalog {...props} />
        </Suspense>
    )
}