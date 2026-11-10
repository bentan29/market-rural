"use client"

import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { updateListingAction } from "@/features/actions/private/listings/update-listing.action"
import type { CreateListingPayload, ListingFormInput } from "@/features/schemas/listings/listing.schema"
import type { MyListingDetail } from "@/lib/types/listing.type"
import { ListingFormApp, type ListingSubmitResult } from "../form/ListingForm-App"

type Props = {
    listingId: string
    listing: MyListingDetail
}

export function EditListingContainer({ listingId, listing }: Props) {
    const router = useRouter()

    //- El formulario trabaja con strings en los campos numéricos
    const defaultValues: Partial<ListingFormInput> = {
        operation: listing.operation,
        rentPeriod: listing.rentPeriod ?? undefined,
        machineType: listing.machineType,
        title: listing.title,
        condition: listing.condition,
        year: String(listing.year),
        hours: listing.hours?.toString() ?? "",
        horsepower: listing.horsepower?.toString() ?? "",
        currency: listing.currency,
        price: String(listing.price),
        description: listing.description,
        country: listing.country ?? "",
        location: listing.location,
    }

    async function handleSubmit(payload: CreateListingPayload): Promise<ListingSubmitResult> {
        const res = await updateListingAction(listingId, payload)

        if (!res.ok) {
            if (res.status === 401) {
                router.push(`/login?next=/dashboard/publicaciones/${listingId}/editar`)
            }
            return { ok: false, message: res.message }
        }

        toast.add({ type: "success", description: "Cambios guardados" })
        router.push("/dashboard/publicaciones")
        router.refresh()
        return { ok: true }
    }

    return (
        <ListingFormApp
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            submitLabel="Guardar cambios"
            submittingLabel="Guardando…"
        />
    )
}