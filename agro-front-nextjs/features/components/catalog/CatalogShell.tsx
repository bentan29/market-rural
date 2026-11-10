import { Suspense } from "react"
import { PageTitle } from "@/features/components/global/header/PageTitle"
import type { CatalogCountry } from "@/features/constants/catalog/countries"
import CatalogView from "./CatalogView"

type Props = {
    country: CatalogCountry | null
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function CatalogShell({ country, searchParams }: Props) {
    return (
        <div className="flex flex-col gap-8 pb-8">
            <PageTitle
                eyebrow="Catálogo"
                title={country ? `Maquinaria agrícola en ${country.name}` : "Maquinaria agrícola en venta y alquiler"}
            />

            <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
                <CatalogView 
                    country={country} 
                    searchParams={searchParams} 
                />
            </Suspense>
        </div>
    )
}