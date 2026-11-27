import { createSearchParamsCache, parseAsInteger, parseAsStringLiteral } from "nuqs/server"
import { Suspense } from "react"
import { InquiriesTabs, type InquiryTab } from "@/features/components/dashboard/inquiries/InquiriesTabs"
import { ReceivedInquiries } from "@/features/components/dashboard/inquiries/ReceivedInquiries"
import { SentInquiries } from "@/features/components/dashboard/inquiries/SentInquiries"
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader"
import { requireUser } from "@/lib/auth/get-user"

const TABS = ["recibidas", "enviadas"] as const satisfies readonly InquiryTab[]

const cache = createSearchParamsCache({
    tab: parseAsStringLiteral(TABS),
    page: parseAsInteger.withDefault(1),
})

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

//- Lee la sesión y la URL: por eso va dentro de un Suspense
async function InquiriesContent({ searchParams }: Props) {
    const user = await requireUser()
    const isSeller = user.role === "SELLER"

    const { tab: requested, page: requestedPage } = await cache.parse(searchParams)

    //- El usuario común solo tiene "enviadas"; el vendedor empieza por "recibidas"
    const tab: InquiryTab = isSeller ? (requested ?? "recibidas") : "enviadas"
    const page = Math.min(10_000, Math.max(1, requestedPage))

    return (
        <div className="flex flex-col gap-6">
            {isSeller && <InquiriesTabs active={tab} />}

            {tab === "recibidas" ? <ReceivedInquiries page={page} /> : <SentInquiries page={page} />}
        </div>
    )
}

export default function ConsultasPage(props: Props) {
    return (
        <div className="flex flex-col gap-6">
            <DashboardPageHeader
                title="Consultas"
                subtitle="Los mensajes que enviaste y, si vendés, los que recibiste"
            />

            <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
                <InquiriesContent {...props} />
            </Suspense>
        </div>
    )
}