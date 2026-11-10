"use client"

import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { createListing } from "@/features/actions/private/listings/create-listing.action"
import type { CreateListingPayload } from "@/features/schemas/listings/listing.schema"
import { ListingFormApp, type ListingSubmitResult } from "./ListingForm-App"

type Props = {
    defaultLocation?: string
    defaultCountry?: string
}

export function CreateListingContainer({ defaultLocation, defaultCountry }: Props) {
    const router = useRouter()

    async function handleSubmit(payload: CreateListingPayload): Promise<ListingSubmitResult> {
        //- action
        const res = await createListing(payload)

        if (!res.ok) {
            //- Sesión vencida: al login, y de vuelta acá
            if (res.status === 401) {
                router.push("/login?next=/dashboard/publicaciones/crear")
            }
            return { ok: false, message: res.message }
        }

        toast.add({ type: "success", description: "¡Publicación creada!" })
        router.push("/dashboard/publicaciones")
        router.refresh()
        return { ok: true }
    }

    return (
        <ListingFormApp
            onSubmit={handleSubmit}
            defaultLocation={defaultLocation}
            defaultCountry={defaultCountry}
        />
    )
}