"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { CATALOG_COUNTRIES } from "@/features/constants/catalog/countries"
import { CountryFlag } from "@/features/components/global/country/CountryFlag"
import { cn } from "@/lib/utils"

//- Preferencia del visitante: más adelante sirve para sugerir su país (nunca para redirigir por IP)
const rememberCountry = (slug: string) => {
    document.cookie = `mr_country=${slug}; path=/; max-age=31536000; samesite=lax`
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={className}
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
    )
}

export function CountrySwitcher() {

    const params = useParams<{ pais?: string; slug?: string }>()
    const searchParams = useSearchParams()
    if (params.slug) return null // /agente/[slug]
    const current = params.pais ?? null

    //- Al cambiar de país se conservan los filtros, pero se vuelve a la página 1
    const qs = new URLSearchParams(searchParams.toString())
    qs.delete("page")
    const suffix = qs.toString() ? `?${qs}` : ""

    const options = [
        { slug: null, code: null, label: "Global", href: `/maquinarias${suffix}` },
        ...CATALOG_COUNTRIES.map((c) => ({
            slug: c.slug,
            code: c.code,
            label: c.name,
            href: `/maquinarias/${c.slug}${suffix}`,
        })),
    ]

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">País</p>

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
                                "inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-lime-400/40",
                                active
                                    ? "border-white bg-white text-teal-950"
                                    : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
                            )}
                        >
                            {option.code ? <CountryFlag code={option.code} /> : <GlobeIcon className="size-3.5 shrink-0" />}
                            {option.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}