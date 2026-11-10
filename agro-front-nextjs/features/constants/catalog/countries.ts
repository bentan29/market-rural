//- Mantenelo alineado con SELLER_COUNTRIES del backend.
export const CATALOG_COUNTRIES = [
    { slug: "uruguay", code: "UY", name: "Uruguay" },
    { slug: "argentina", code: "AR", name: "Argentina" },
    { slug: "brasil", code: "BR", name: "Brasil" },
    { slug: "paraguay", code: "PY", name: "Paraguay" },
] as const

export type CatalogCountry = (typeof CATALOG_COUNTRIES)[number]

export const COUNTRY_BY_SLUG: Record<string, CatalogCountry | undefined> = Object.fromEntries(
    CATALOG_COUNTRIES.map((country) => [country.slug, country]),
)

//- El resultado del COUNTRY_BY_SLUG seria 
// [
//     ["uruguay", { slug: "uruguay", code: "UY", name: "Uruguay" }],
//     ["argentina", { slug: "argentina", code: "AR", name: "Argentina" }],
//     ["brasil", { slug: "brasil", code: "BR", name: "Brasil" }],
// ]