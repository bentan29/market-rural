import { LISTING_OPERATIONS, LISTING_SORTS } from "@/features/Nuqs/private/private-listings-nuqs"
import { ListingOperation, ListingStatus } from "@/lib/types/listing.type";

export const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> = {
    PUBLISHED: { label: 'Publicada', className: 'bg-lime-100 text-lime-800' },
    DRAFT: { label: 'Borrador', className: 'bg-stone-100 text-stone-700' },
    PAUSED: { label: 'Pausada', className: 'bg-amber-100 text-amber-800' },
    SOLD: { label: 'Vendida', className: 'bg-sky-100 text-sky-800' },
    RENTED: { label: 'Alquilada', className: 'bg-sky-100 text-sky-800' },
    EXPIRED: { label: 'Expirada', className: 'bg-red-100 text-red-800' },
}


export const OPERATION_LABEL: Record<(typeof LISTING_OPERATIONS)[number], string> = {
    SALE: "Venta",
    RENT: "Alquiler",
}

export const SORT_LABEL: Record<(typeof LISTING_SORTS)[number], string> = {
    newest: "Más recientes",
    price_asc: "Precio: menor a mayor",
    price_desc: "Precio: mayor a menor",
    year_asc: "Año: más antiguas",
    year_desc: "Año: más nuevas",
}


export type StatusTransition = { to: ListingStatus; label: string; description: string }


//- Los cambios de estado que ofrece el menú: todos menos el actual. El backend valida solo la coherencia con la operación
export function getStatusTransitions(
    status: ListingStatus,
    operation: ListingOperation,
): StatusTransition[] {
    const publish: StatusTransition =
        status === 'DRAFT'
            ? { to: 'PUBLISHED', label: 'Publicar', description: 'Aparece en el catálogo para los compradores.' }
            : status === 'PAUSED'
            ? { to: 'PUBLISHED', label: 'Reanudar', description: 'Vuelve a mostrarse en el catálogo.' }
            : { to: 'PUBLISHED', label: 'Volver a publicar', description: 'Vuelve a mostrarse en el catálogo.' }

    const close: StatusTransition =
        operation === 'SALE'
            ? { to: 'SOLD', label: 'Marcar como vendida', description: 'La máquina ya no está disponible y deja de mostrarse.' }
            : { to: 'RENTED', label: 'Marcar como alquilada', description: 'La máquina está alquilada y deja de mostrarse.' }

    const options: StatusTransition[] = [
        publish,
        { to: 'PAUSED', label: 'Pausar', description: 'Se oculta del catálogo. Podés reanudarla cuando quieras.' },
        { to: 'DRAFT', label: 'Pasar a borrador', description: 'Se oculta y queda guardada para seguir editándola.' },
        close,
    ]

    return options.filter((option) => option.to !== status)
}