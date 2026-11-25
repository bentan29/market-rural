
"use client"

import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
    ArrowUpRight01Icon,
    Calendar03Icon,
    CrownIcon,
    DashboardSpeed01Icon,
    HorseHeadIcon,
    Location01Icon,
    TractorIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    MACHINE_GROUPS,
    type MachineItem,
} from "@/features/constants/products/type-machine.constant"
import type { ListingType } from "@/lib/types/listing.type"
import { cn } from "@/lib/utils"
import { ButtonFavorite } from "./Button-Favorite"
import { COUNTRY_NAMES } from "@/features/constants/catalog/countries"
import { cloudinaryCardLoader } from "@/lib/cloudinary"

const conditionLabel = {
    NEW: "Nueva",
    USED: "Usada",
} as const

const operationConfig = {
    SALE: {
        label: "En venta",
        className: "bg-stone-950 text-white",
    },
    RENT: {
        label: "En alquiler",
        className: "bg-blue-950 text-white",
    },
} as const

const rentPeriodLabel = {
    DAY: "/ día",
    WEEK: "/ semana",
    MONTH: "/ mes",
} as const

const MACHINE_LABELS = new Map<string, string>(
    MACHINE_GROUPS
        .flatMap<MachineItem>((group) => group.items)
        .map((item) => [item.value, item.label])
)

interface Spec {
    icon: IconSvgElement
    label: string
    value: string
}

interface Props {
    listing: ListingType
    isFavorite?: boolean
}

export function ListingCard({ listing }: Props) {

    const { id, slug, title, operation, rentPeriod, condition, currency, price,
        machineType, year, hours, horsepower, location, featured, coverImageId, seller,
    } = listing

    const formattedPrice = new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(price)

    const specs: Spec[] = [
        {
            icon: Calendar03Icon,
            label: "Año",
            value: String(year),
        },
        {
            icon: DashboardSpeed01Icon,
            label: "Horas",
            value: hours != null
                ? `${hours.toLocaleString("es-UY")} h`
                : "—",
        },
        {
            icon: HorseHeadIcon,
            label: "Potencia",
            value: horsepower != null
                ? `${horsepower} HP`
                : "—",
        },
    ]

    const op = operationConfig[operation]
    const category = MACHINE_LABELS.get(machineType) ?? "Maquinaria"

    const sellerName = seller?.displayName ?? "Vendedor"
    const sellerSlug = seller?.slug

    const initials = sellerName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")

    const countryLabel = listing.country
        ? COUNTRY_NAMES.get(listing?.country) ?? listing.country
        : null

    return (
        <Card
            className={cn(
                "group relative isolate gap-0 overflow-hidden rounded-sm",
                "border border-stone-200 bg-white p-0 text-stone-900 shadow-none",
                "transition-all duration-300",
                "hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5"
            )}
        >
            {/* Enlace principal: toda la card */}
            <Link
                href={`/maquinaria/${slug}`}
                aria-label={`Ver publicación: ${title}`}
                className="absolute inset-0 z-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand"
            />

            {/* Imagen */}
            <div className="relative z-10 aspect-4/3 overflow-hidden bg-stone-100 pointer-events-none">
                {coverImageId ? (
                    <Image
                        loader={cloudinaryCardLoader}
                        src={coverImageId}
                        alt={title}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="grid size-full place-items-center text-stone-300">
                        <HugeiconsIcon icon={TractorIcon} size={48} strokeWidth={1.2} />
                    </div>
                )}
                {/* Degradado inferior */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent" />

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                    <Badge
                        className={cn(
                            "rounded-sm border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            op.className
                        )}
                    >
                        {op.label}
                    </Badge>

                    {featured && (
                        <Badge className="rounded-sm border-0 bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950 hover:bg-amber-400">
                            <HugeiconsIcon icon={CrownIcon} strokeWidth={2} />
                            Destacada
                        </Badge>
                    )}
                </div>

                {/* Favoritos: independiente del enlace principal */}
                <div className="pointer-events-auto absolute right-3 top-3">
                    <ButtonFavorite listingId={id} />
                </div>

                {/* Categoría sobre imagen */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        {category}
                    </span>

                    <span className="size-1 rounded-full bg-lime-400" />

                    <span className="text-xs text-white/85">
                        {conditionLabel[condition]}
                    </span>
                </div>
            </div>

            {/* Información */}
            <div className="relative z-10 space-y-4 p-4 pointer-events-none">

                {/* Título y ubicación */}
                <div className="space-y-2">
                    <h3 className="line-clamp-2 min-h-11 text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-emerald-800">
                        {title}
                    </h3>

                    <div className="flex min-w-0 items-center gap-2 text-xs text-stone-500">
                        <HugeiconsIcon
                            icon={Location01Icon}
                            size={15}
                            strokeWidth={1.8}
                            className="shrink-0"
                        />

                        <span className="truncate">{location}</span>

                        {countryLabel && (
                            <>
                                <span className="size-1 shrink-0 rounded-full bg-stone-300" />

                                <span className="shrink-0 font-medium text-stone-600">
                                    {countryLabel}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Ficha técnica */}
                <dl className="grid grid-cols-3 divide-x divide-stone-200 border-y border-stone-200 py-3">
                    {specs.map(({ icon, label, value }) => (
                        <div
                            key={label}
                            className="flex min-w-0 flex-col items-center gap-1 px-1.5 first:pl-0 last:pr-0"
                        >
                            <HugeiconsIcon
                                icon={icon}
                                size={17}
                                strokeWidth={1.7}
                                className="text-stone-400"
                            />

                            <dt className="text-[10px] text-stone-500">
                                {label}
                            </dt>

                            <dd className="max-w-full truncate text-xs font-semibold tabular-nums">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>

                {/* Precio y CTA */}
                <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                            {operation === "RENT" ? "Precio de alquiler" : "Precio de venta"}
                        </p>

                        <p className="truncate text-xl font-bold leading-tight tracking-tight tabular-nums">
                            {formattedPrice}

                            {operation === "RENT" && rentPeriod && (
                                <span className="ml-1 text-xs font-medium text-stone-500">
                                    {rentPeriodLabel[rentPeriod]}
                                </span>
                            )}
                        </p>
                    </div>

                    <Link
                        href={`/maquinaria/${slug}`}
                        className={cn(
                            "pointer-events-auto inline-flex shrink-0 items-center gap-1.5",
                            "rounded-sm bg-stone-950 px-3 py-2.5",
                            "text-xs font-semibold text-white",
                            "transition-colors duration-200",
                            "hover:bg-emerald-800",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        )}
                    >
                        Ver publicación

                        <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            size={16}
                            strokeWidth={1.8}
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </Link>
                </div>
            </div>

            {/* Perfil del vendedor */}
            <div className="relative z-10 flex items-center justify-between gap-2 border-t border-stone-200 bg-stone-50/80 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-stone-200 text-[11px] font-bold text-stone-700">
                        {initials || "V"}
                    </span>

                    <div className="min-w-0">
                        <p className="text-[10px] text-stone-400">
                            Publicado por
                        </p>

                        <p className="truncate text-xs font-semibold text-stone-800">
                            {sellerName}
                        </p>
                    </div>
                </div>

                {sellerSlug ? (
                    <Link
                        href={`/agente/${sellerSlug}`}
                        aria-label={`Ver perfil de ${sellerName}`}
                        className={cn(
                            "pointer-events-auto inline-flex shrink-0 items-center gap-1",
                            "rounded-sm px-2 py-2 text-xs font-semibold text-emerald-800",
                            "transition-colors hover:bg-emerald-50 hover:text-emerald-950",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        )}
                    >
                        Ver perfil
                        <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            size={15}
                            strokeWidth={1.8}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                ) : (
                    <span className="text-xs text-stone-400">
                        Vendedor
                    </span>
                )}
            </div>
        </Card>
    )
}
