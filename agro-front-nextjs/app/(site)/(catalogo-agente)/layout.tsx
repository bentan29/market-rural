import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

import { CatalogFilters } from "@/features/components/filters-sidebar/CatalogFilters";
import { FiltersToggle } from "@/features/components/filters-sidebar/FiltersToggle";
import { AppBreadcrumb } from "@/features/components/global/breadcrumb/BreadCrumb-App";
import { FooterApp } from "@/features/components/global/footer/Footer-App";
import { Suspense } from "react";

const FOOTER_ID = "site-footer"

export default function CatalagoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        //- El alto mínimo descuenta la navbar: con min-h-screen la página siempre sobraba por el alto del header
        <div className="flex min-h-[calc(100svh-var(--header-height))] flex-col">


            <SidebarProvider className="flex-1 min-h-0 bg-teal-900">

                <Suspense fallback={null}>
                    <CatalogFilters />
                </Suspense>

                <SidebarInset className="min-w-0 flex-1 gap-6">

                    <header className="flex h-16 shrink-0 bg-secondary items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">

                        <div className="flex items-center gap-2 px-4">

                            <div className="md:hidden">
                                <FiltersToggle />
                            </div>

                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />

                            <Suspense fallback={null}>
                                <AppBreadcrumb />
                            </Suspense>

                        </div>
                    </header>

                    <main className="flex-1 px-4">
                        {children}
                    </main>

                </SidebarInset>

            </SidebarProvider>

            {/* A todo el ancho, debajo de la barra y del contenido */}
            <div id={FOOTER_ID}>
                <FooterApp />
            </div>

            {/* <SidebarFooterGuard footerId={FOOTER_ID} /> */}

            {/* <FooterApp /> */}

        </div>
    );
}