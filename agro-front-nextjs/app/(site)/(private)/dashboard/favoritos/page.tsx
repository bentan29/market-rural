import { Suspense } from "react"
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader"
import { MyFavoritesResults } from "@/features/components/favorites/MyFavoritesReults"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function FavoritosPage({ searchParams }: Props) {
    return (
        <div className="flex flex-col gap-6">
            <DashboardPageHeader title="Mis favoritos" subtitle="Las máquinas que guardaste" />

            <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
                <MyFavoritesResults searchParams={searchParams} />
            </Suspense>
        </div>
    )
}