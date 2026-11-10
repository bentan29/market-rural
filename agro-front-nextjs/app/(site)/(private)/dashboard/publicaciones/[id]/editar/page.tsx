import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader"
import { getMyListingAction } from "@/features/actions/private/listings/get-one-listing.action"
import { EditListingContainer } from "@/features/components/dashboard/listings/edit-Listing/EditListing-container"


type Props = {
  params: Promise<{ id: string }>
}

async function EditContent({ params }: Props) {
    const { id } = await params
    const result = await getMyListingAction(id)

    if (!result.ok) {
        if (result.status === 401) redirect(`/login?next=/dashboard/publicaciones/${id}/editar`)
        if (result.status === 404) notFound()

        return (
            <p
                role="alert"
                className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
                {result.message}
            </p>
        )
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            <EditListingContainer listingId={id} listing={result.listing} />
        </div>
    )
}

export default function EditarPublicacionPage(props: Props) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader title="Editar publicación" />

      <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
        <EditContent params={props.params} />
      </Suspense>
    </div>
  )
}