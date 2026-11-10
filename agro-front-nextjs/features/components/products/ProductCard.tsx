"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  DashboardSpeed01Icon,
  FavouriteIcon,
  HorseHeadIcon,
  Location01Icon,
  TractorIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MACHINE_GROUPS, type MachineItem } from "@/features/constants/products/type-machine.constant"
import type { ListingType } from "@/lib/types/listing.type"
import { cn } from "@/lib/utils"

const conditionLabel = { NEW: "Nueva", USED: "Usada" } as const

const operationConfig = {
  SALE: { label: "Venta", className: "bg-stone-900 text-white" },
  RENT: { label: "Alquiler", className: "bg-orange-600 text-white" },
} as const

const rentPeriodLabel = {
  DAY: "/ día",
  WEEK: "/ semana",
  MONTH: "/ mes",
} as const

//- "combine_harvester" -> "Cosechadora" (mismo patrón que MACHINE_ITEMS, para evitar la unión de tuplas)
const MACHINE_LABELS = new Map<string, string>(
  MACHINE_GROUPS.flatMap<MachineItem>((group) => group.items).map((item) => [item.value, item.label]),
)

interface Spec {
  icon: IconSvgElement
  label: string
  value: string
}

interface Props {
  listing: ListingType
  initialFavorite?: boolean
  onToggleFavorite?: (id: string, value: boolean) => void
}

export function ProductCard({ listing, initialFavorite = false, onToggleFavorite }: Props) {
  const {
    id, slug, title, operation, rentPeriod, condition, currency, price,
    machineType, year, hours, horsepower, location, featured, imageUrl,
  } = listing

  const [favorite, setFavorite] = useState(initialFavorite)

  const formattedPrice = new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price)

  const handleFavorite = () => {
    const next = !favorite
    setFavorite(next)
    onToggleFavorite?.(id, next)
  }

  const specs: Spec[] = [
    { icon: Calendar03Icon, label: "Año", value: String(year) },
    {
      icon: DashboardSpeed01Icon,
      label: "Horas de uso",
      value: hours != null ? `${hours.toLocaleString("es-UY")} h` : "—",
    },
    {
      icon: HorseHeadIcon,
      label: "Potencia",
      value: horsepower != null ? `${horsepower} HP` : "—",
    },
  ]

  const op = operationConfig[operation]
  const category = MACHINE_LABELS.get(machineType) ?? "Maquinaria"

  return (
    <Card
      className={cn(
        "group relative gap-0 overflow-hidden rounded-sm border border-stone-200 bg-white py-0 text-stone-900 shadow-none",
        "transition-colors duration-300 hover:border-stone-900",
      )}
    >
      {/* Imagen */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover saturate-[0.8] transition-[filter] duration-500 ease-out group-hover:saturate-100 motion-reduce:transition-none"
          />
        ) : (
          <div className="grid size-full place-items-center text-stone-300">
            <HugeiconsIcon icon={TractorIcon} size={48} strokeWidth={1.2} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <Badge className={cn("rounded-sm border-0 font-semibold", op.className)}>
            {op.label}
          </Badge>
          {featured && (
            <Badge className="rounded-sm border-0 bg-amber-400 font-semibold text-stone-900 hover:bg-amber-400">
              Destacada
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={favorite}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-sm bg-white/90 text-stone-900 backdrop-blur transition-colors hover:bg-white"
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={16}
            strokeWidth={1.8}
            className={cn("transition-colors", favorite && "fill-orange-600 text-orange-600")}
          />
        </button>
      </div>

      {/* Contenido */}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
            {category}
            <span aria-hidden className="size-1 rounded-full bg-orange-600" />
            {conditionLabel[condition]}
          </p>
          <h3 className="line-clamp-2 min-h-11 text-base font-semibold leading-snug">
            {title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-stone-500">
            <HugeiconsIcon icon={Location01Icon} size={13} strokeWidth={1.8} className="shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        </div>

        {/* Ficha técnica */}
        <dl className="text-[13px]">
          {specs.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-2 border-t border-dashed border-stone-200 py-1.5"
            >
              <dt className="flex items-center gap-1.5 text-stone-500">
                <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} />
                {label}
              </dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between gap-3 border-t border-stone-200 p-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-500">
            {operation === "RENT" ? "Alquiler" : "Precio"}
          </p>
          <p className="text-xl font-bold leading-tight tabular-nums">
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
          className="group/btn grid size-9 shrink-0 place-items-center rounded-sm bg-stone-900 text-white transition-colors duration-300 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 group-hover:bg-orange-600"
        >
          <span className="sr-only">Ver detalle de {title}</span>
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={18}
            strokeWidth={1.8}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </Link>
      </div>
    </Card>
  )
}