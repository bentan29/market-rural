import { buttonVariants } from "@/components/ui/button";
import { getallMyListingsAction } from "@/features/actions/private/listings/get-all-my-listings.action";
import { MyListingsFilters } from "@/features/components/dashboard/listings/table/MyListingsFilter";
import { MyListingsTable } from "@/features/components/dashboard/listings/table/MyListingsTable";
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader";
import { privateListingsNuqs } from "@/features/Nuqs/private/private-listings-nuqs";
import { Add02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSearchParamsCache } from "nuqs/server";
import { Suspense } from "react";

const cache = createSearchParamsCache(privateListingsNuqs)

interface Props {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}


//? ---------------
async function ListeningContent({searchParams} : Props) {

    const filters = await cache.parse(searchParams)
    const result = await getallMyListingsAction({...filters})

    if(!result.ok) {
        if (result.status === 401) redirect("/login?next=/dashboard/suscripcion")
        return (
            <p
                role="alert"
                className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
                {result.message}
            </p>
        )
    }

    //- ¿Hay algún filtro activo? (el orden no cuenta: no excluye nada)
    const hasFilters =
        filters.q !== "" || filters.status.length > 0 || filters.operation.length > 0
        
    const { items, total } = result.data

   

    if (total === 0) {
        //- Con filtros: nada coincide. Sin filtros: todavía no publicó nada
        if (hasFilters) {
            return (
                <div className="rounded-sm border border-dashed p-10 text-center">
                    <p className="font-medium">No hay publicaciones con esos filtros</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Probá con otros o quitá los filtros para ver todas tus publicaciones.
                    </p>
                    <Link
                        href='/dashboard/publicaciones'
                        className={cn(buttonVariants({ variant: "outline" }), "mt-4 rounded-sm")}
                    >
                        Limpiar filtros
                    </Link>
                </div>
            )
        }

        return (
            <div className="rounded-sm border border-dashed p-10 text-center">
                <p className="font-medium">Todavía no publicaste ninguna máquina</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Creá tu primera publicación y empezá a recibir consultas.
                </p>
                <Link
                    href='/dashboard/publicaciones/crear'
                    className={cn(buttonVariants(), "mt-4 rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover")}
                >
                    Crear mi primera publicación
                </Link>
            </div>
        )
    }


    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "publicación" : "publicaciones"}
            </p>
            <MyListingsTable listings={items} />
        </div>
    )
}

//? ---------------
export default function PublicacionesPage({searchParams}: Props) {
    return (
        <div className="flex flex-col gap-6 pb-10">
            <DashboardPageHeader
                title="Mis Publicaciones"
            />

            <div>
                <Link 
                    href="/dashboard/publicaciones/crear"
                    className={cn(buttonVariants({variant: "secondary" }))}
                >
                    <HugeiconsIcon icon={Add02Icon} />
                    Crear nueva
                </Link>
            </div>

            {/* Los hooks de nuqs necesitan su propio Suspense */}
            <Suspense fallback={<div className="h-32 animate-pulse rounded-sm bg-muted" />}>
                <MyListingsFilters />
            </Suspense>

            <Suspense fallback={<div className="h-40 animate-pulse rounded-sm bg-muted" />}>
                <ListeningContent searchParams={searchParams}/> 
            </Suspense>
        </div>
    );
}