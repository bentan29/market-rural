import Image from "next/image"
import { TractorIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMachineLabel } from "@/features/constants/products/type-machine.constant"
import type { ListingType } from "@/lib/types/listing.type"
import { cn } from "@/lib/utils"
import {
  CONDITION_LABEL,
  RENT_PERIOD_LABEL,
  featuredLabel,
  formatDate,
  formatPrice,
} from "./listing-format"
import { STATUS_CONFIG } from "./inputs-labels"
import { ListingActions } from "./ListingActions"

//- Hueco de la foto: hoy muestra un ícono; cuando el backend mande imageUrl, se ve la imagen sin tocar nada más
function Thumb({ listing, className }: { listing: ListingType; className?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-linear-to-br from-teal-50 to-teal-100 ring-1 ring-teal-900/15",
        className
      )}
    >
      {listing.imageUrl ? (
        <Image src={listing.imageUrl} alt="" fill sizes="64px" className="object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-teal-700/50">
          <HugeiconsIcon icon={TractorIcon} size={22} strokeWidth={1.4} />
        </div>
      )}
    </div>
  )
}

function StatusBadges({ listing }: { listing: ListingType }) {
  const status = STATUS_CONFIG[listing.status] ?? {
    label: listing.status,
    className: "bg-stone-100 text-stone-700",
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        <Badge className={cn("rounded-md border-0 font-semibold shadow-xs", status.className)}>
          {status.label}
        </Badge>
        {listing.featured && (
          <Badge className="rounded-md border-0 bg-linear-to-b from-amber-300 to-amber-500 font-bold text-stone-900 shadow-sm shadow-amber-600/30 hover:from-amber-300 hover:to-amber-500">
            Destacada
          </Badge>
        )}
      </div>
      {listing.featured && listing.featuredUntil && (
        <p className="text-xs text-teal-900/60">{featuredLabel(listing.featuredUntil)}</p>
      )}
    </div>
  )
}

function Price({ listing }: { listing: ListingType }) {
  return (
    <>
      {formatPrice(listing.price, listing.currency)}
      {listing.operation === "RENT" && listing.rentPeriod && (
        <span className="ml-1 text-xs font-medium text-teal-900/60">
          {RENT_PERIOD_LABEL[listing.rentPeriod]}
        </span>
      )}
    </>
  )
}

function OperationTag({ listing }: { listing: ListingType }) {
  const isRent = listing.operation === "RENT"

  return (
    <span
      className={cn(
        "inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        isRent ? "bg-teal-900 text-teal-50" : "bg-teal-100 text-teal-900"
      )}
    >
      {isRent ? "Alquiler" : "Venta"}
    </span>
  )
}

type Props = {
  listings: ListingType[]
}

export function MyListingsTable({ listings }: Props) {
  return (
    <>
      {/* Celular: tarjetas */}
      <ul className="space-y-3 md:hidden">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className={cn(
              "overflow-hidden rounded-lg border border-l-4 border-teal-950/15 bg-white shadow-md shadow-teal-950/5",
              listing.featured ? "border-l-amber-400" : "border-l-teal-800"
            )}
          >
            <div className="flex items-start gap-3 p-3">
              <Thumb listing={listing} className="size-16" />

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-semibold leading-snug text-teal-950">{listing.title}</p>
                <p className="mt-0.5 truncate text-xs text-teal-900/60">
                  {getMachineLabel(listing.machineType)} · {CONDITION_LABEL[listing.condition]} · {listing.year}
                </p>
              </div>

              <ListingActions listing={listing} />
            </div>

            <div className="flex items-end justify-between gap-3 border-t border-teal-950/10 bg-teal-50/70 px-3 py-3">
              <div className="space-y-1">
                <OperationTag listing={listing} />
                <p className="text-base font-bold tabular-nums text-teal-950">
                  <Price listing={listing} />
                </p>
              </div>
              <StatusBadges listing={listing} />
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet y escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-sm border border-teal-950/20 bg-white shadow-lg shadow-teal-950/10 md:block">
        <Table className="[&_td]:px-4 [&_td]:py-3 [&_th]:px-4">
          <TableHeader className="bg-linear-to-br from-teal-600 via-teal-800 to-teal-900 [&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-50">
                Publicación
              </TableHead>
              <TableHead className="h-11 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-teal-50">
                Precio
              </TableHead>
              <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-50">
                Estado
              </TableHead>
              <TableHead className="hidden h-11 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-50 lg:table-cell">
                Año
              </TableHead>
              <TableHead className="hidden h-11 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-50 xl:table-cell">
                Creada
              </TableHead>
              <TableHead className="h-11 text-right text-teal-50">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listings.map((listing) => (
              <TableRow
                key={listing.id}
                className={cn(
                  "border-teal-950/10 transition-colors odd:bg-white even:bg-teal-50/40 hover:bg-teal-100/60",
                  listing.featured && "shadow-[inset_3px_0_0_0_var(--color-amber-400)]"
                )}
              >
                <TableCell className="max-w-80">
                  <div className="flex items-center gap-3">
                    <Thumb listing={listing} className="size-12" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-teal-950">{listing.title}</p>
                      <p className="truncate text-xs text-teal-900/60">
                        {getMachineLabel(listing.machineType)} · {CONDITION_LABEL[listing.condition]} · {listing.location}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="space-y-1 text-right tabular-nums">
                  <OperationTag listing={listing} />
                  <p className="font-bold text-teal-950">
                    <Price listing={listing} />
                  </p>
                </TableCell>

                <TableCell>
                  <StatusBadges listing={listing} />
                </TableCell>

                <TableCell className="hidden font-medium tabular-nums text-teal-950 lg:table-cell">
                  {listing.year}
                </TableCell>

                <TableCell className="hidden text-teal-900/60 xl:table-cell">
                  {formatDate(listing.createdAt)}
                </TableCell>

                <TableCell className="text-right">
                  <ListingActions listing={listing} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}