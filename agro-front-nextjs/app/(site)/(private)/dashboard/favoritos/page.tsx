import { MyFavoritesReults } from "@/features/components/favorites/MyFavoritesReults";
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader";
import { Suspense } from "react";

export default function FavoritosPage() {
    return (
        <div className="flex flex-col gap-8 mb-10">
            <DashboardPageHeader
                title="Favoritos"
                subtitle="Lista de Maquinarias guardas"
            />

            <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
                <MyFavoritesReults/>
            </Suspense>
        </div>
    );
}