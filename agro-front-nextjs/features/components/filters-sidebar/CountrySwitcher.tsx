"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { CATALOG_COUNTRIES } from "@/features/constants/catalog/countries"
import { cn } from "@/lib/utils"

//- Preferencia del visitante: más adelante sirve para sugerir su país (nunca para redirigir por IP)
const rememberCountry = (slug: string) => {
    document.cookie = `mr_country=${slug}; path=/; max-age=31536000; samesite=lax`
}

export function CountrySwitcher() {
    const params = useParams<{ pais?: string }>()
    const searchParams = useSearchParams()
    const current = params.pais ?? null

    //- Al cambiar de país se conservan los filtros, pero se vuelve a la página 1
    const qs = new URLSearchParams(searchParams.toString())
    qs.delete("page")
    const suffix = qs.toString() ? `?${qs}` : ""

    const options = [
        { slug: null, label: "Global", href: `/catalogo${suffix}` },
        ...CATALOG_COUNTRIES.map((c) => ({ slug: c.slug, label: c.name, href: `/catalogo/${c.slug}${suffix}` })),
    ]

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Pais</p>

            <nav aria-label="País" className="flex flex-wrap gap-1.5">
                {options.map((option) => {
                    const active = option.slug === current

                    return (
                        <Link
                            key={option.label}
                            href={option.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => rememberCountry(option.slug ?? "global")}
                            className={cn(
                                "inline-flex h-7 items-center rounded-sm border px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40",
                                active
                                ? "border-white bg-white text-teal-950"
                                : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
                            )}
                        >
                            {option.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}