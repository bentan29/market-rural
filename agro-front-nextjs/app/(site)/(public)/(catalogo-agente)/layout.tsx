import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import { CatalogFilters } from "@/features/components/filters-sidebar/CatalogFilters";
import { FiltersToggle } from "@/features/components/filters-sidebar/FiltersToggle";
import { AppBreadcrumb } from "@/features/components/global/breadcrumb/BreadCrumb-App";
import { Suspense } from "react";

export default function CatalagoLayout({children}: {children: React.ReactNode}) {
    return (
        // <div className="[--header-height:calc(--spacing(16))]">

            <SidebarProvider className="min-h-[calc(100svh-var(--header-height))]">

                {/* Los hooks de nuqs, useParams y useSearchParams necesitan su Suspense */}
                <Suspense fallback={null}>
                    <CatalogFilters />
                </Suspense>
                
                <SidebarInset className="min-w-0 gap-6">
                    <header className="flex h-16 shrink-0 bg-secondary items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4 ">
                            
                       
                            <FiltersToggle />

                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
{/* 
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Build Your Application
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb> */}

                            <AppBreadcrumb />

                        </div>
                    </header>

                    <main className="px-4">
                        {children}
                    </main>
                </SidebarInset>
                     
            </SidebarProvider>
        // </div>
    );
}