import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
    Calendar03Icon,
    DashboardSpeed01Icon,
    FlashIcon,
    Location01Icon,
    TractorIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
// import { ContactForm } from "@/features/components/listing/ContactForm"
import { CATALOG_COUNTRIES } from "@/features/constants/catalog/countries"
import { getMachineLabel } from "@/features/constants/products/type-machine.constant"
import { getPublicListing } from "@/features/actions/public/listings/listing-detail"
import { telUrl, whatsappUrl } from "@/features/helpers/contact-phone"

const SLUG_REGEX = /^[a-z0-9-]{1,120}$/

const CONDITION_LABEL = { NEW: "Nueva", USED: "Usada" } as const
const RENT_PERIOD_LABEL = { DAY: "por día", WEEK: "por semana", MONTH: "por mes" } as const

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const listing = SLUG_REGEX.test(slug) ? await getPublicListing(slug) : null

    if (!listing) return { title: "Publicación no encontrada", robots: { index: false } }

    const title = `${listing.title} | MarketRural`
    const description = listing.description.replace(/\s+/g, " ").slice(0, 155)

    return {
        title,
        description,
        alternates: { canonical: `/maquinaria/${listing.slug}` },
        openGraph: { title, description, type: "website" },
    }
}

async function ListingDetail({ params }: Props) {
    const { slug } = await params
    if (!SLUG_REGEX.test(slug)) notFound()

    const listing = await getPublicListing(slug)
    if (!listing) notFound()

    const { seller } = listing
    const country = CATALOG_COUNTRIES.find((c) => c.code === listing.country)
    const category = getMachineLabel(listing.machineType)

    const price = new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: listing.currency,
        maximumFractionDigits: 0,
    }).format(listing.price)

    const waText = `Hola ${seller.displayName}, vi "${listing.title}" en MarketRural y me interesa.`
    const wa = seller.whatsapp ? whatsappUrl(seller.whatsapp, seller.country, waText) : null
    const tel = telUrl(seller.phone, seller.country)

    const specs = [
        { icon: Calendar03Icon, label: "Año", value: String(listing.year) },
        {
            icon: DashboardSpeed01Icon,
            label: "Horas de uso",
            value: listing.hours != null ? `${listing.hours.toLocaleString("es-UY")} h` : "—",
        },
        {
            icon: FlashIcon,
            label: "Potencia",
            value: listing.horsepower != null ? `${listing.horsepower} HP` : "—",
        },
        {
            icon: Location01Icon,
            label: "Ubicación",
            value: [listing.location, country?.name].filter(Boolean).join(", "),
        },
    ]

    //- Datos estructurados para Google. Solo las ventas llevan "oferta": un alquiler no es un precio de venta
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description,
        category,
        ...(listing.operation === "SALE" && {
            offers: {
                "@type": "Offer",
                price: listing.price,
                priceCurrency: listing.currency,
                availability: "https://schema.org/InStock",
                itemCondition:
                    listing.condition === "NEW"
                        ? "https://schema.org/NewCondition"
                        : "https://schema.org/UsedCondition",
                seller: { "@type": "Organization", name: seller.displayName },
            },
        }),
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />

            <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Link href="/maquinarias" className="hover:text-foreground hover:underline">Catálogo</Link>
                {country && (
                    <>
                        <span aria-hidden>/</span>
                        <Link href={`/maquinarias/${country.slug}`} className="hover:text-foreground hover:underline">
                            {country.name}
                        </Link>
                    </>
                )}
                <span aria-hidden>/</span>
                <span className="truncate text-foreground">{listing.title}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">

                {/* Columna principal */}
                <div className="min-w-0 space-y-8">
                    <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-stone-100">
                        {listing.imageUrl ? (
                            <Image
                                src={listing.imageUrl}
                                alt={listing.title}
                                fill
                                priority
                                sizes="(min-width: 1024px) 60vw, 100vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="grid size-full place-items-center text-stone-300">
                                <HugeiconsIcon icon={TractorIcon} size={72} strokeWidth={1.2} />
                            </div>
                        )}
                    </div>

                    <header className="space-y-3">
                        <p className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                            {category}
                            <span aria-hidden className="size-1 rounded-full bg-orange-600" />
                            {CONDITION_LABEL[listing.condition]}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                className={
                                    listing.operation === "RENT"
                                        ? "rounded-sm border-0 bg-orange-600 font-semibold text-white"
                                        : "rounded-sm border-0 bg-stone-900 font-semibold text-white"
                                }
                            >
                                {listing.operation === "RENT" ? "Alquiler" : "Venta"}
                            </Badge>
                            {listing.featured && (
                                <Badge className="rounded-sm border-0 bg-amber-400 font-semibold text-stone-900 hover:bg-amber-400">
                                    Destacada
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
                            {listing.title}
                        </h1>
                    </header>

                    <dl className="grid gap-x-8 sm:grid-cols-2">
                        {specs.map(({ icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-center justify-between gap-3 border-t border-dashed border-stone-200 py-3 text-sm"
                            >
                                <dt className="flex items-center gap-2 text-stone-500">
                                    <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
                                    {label}
                                </dt>
                                <dd className="text-right font-medium tabular-nums">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <section className="space-y-3">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Descripción
                        </h2>
                        <p className="whitespace-pre-line leading-relaxed">{listing.description}</p>
                    </section>
                </div>

                {/* Columna lateral: precio, vendedor y formulario */}
                <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">

                    <div className="space-y-4 rounded-sm border border-stone-200 bg-white p-5">
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-stone-500">
                                {listing.operation === "RENT" ? "Alquiler" : "Precio"}
                            </p>
                            <p className="text-3xl font-bold tabular-nums">
                                {price}
                                {listing.operation === "RENT" && listing.rentPeriod && (
                                    <span className="ml-2 text-sm font-medium text-stone-500">
                                        {RENT_PERIOD_LABEL[listing.rentPeriod]}
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="border-t border-dashed border-stone-200 pt-4">
                            <p className="text-[10px] uppercase tracking-wide text-stone-500">Publicado por</p>
                            <Link
                                href={`/agente/${seller.slug}`}
                                className="font-semibold underline-offset-4 hover:underline"
                            >
                                {seller.displayName}
                            </Link>
                            <p className="text-sm text-stone-500">{seller.location}</p>
                        </div>

                        {(wa || tel) && (
                            <div className="flex flex-wrap gap-2">
                                {wa && (
                                    <a
                                        href={wa}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 flex-1 items-center justify-center rounded-sm bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
                                    >
                                        WhatsApp
                                    </a>
                                )}
                                {tel && (
                                    <a
                                        href={tel}
                                        className="inline-flex h-10 flex-1 items-center justify-center rounded-sm border border-stone-300 px-4 text-sm font-semibold hover:bg-stone-50"
                                    >
                                        Llamar
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* <ContactForm
                        slug={listing.slug}
                        listingTitle={listing.title}
                        sellerName={seller.displayName}
                    /> */}
                </aside>
            </div>
        </div>
    )
}

export default function MaquinariaPage(props: Props) {
    return (
        <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse rounded-sm bg-muted" />}>
            <ListingDetail {...props} />
        </Suspense>
    )
}