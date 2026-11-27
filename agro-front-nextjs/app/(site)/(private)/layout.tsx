import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VerifyEmailBanner } from "@/features/components/auth/verification/VerifyEmailBanner";
import { DashboardSidebar } from "@/features/components/dashboard/sidebar/DashboardSidebar";
import { AppBreadcrumb } from "@/features/components/global/breadcrumb/BreadCrumb-App";
import { Suspense } from "react";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            className="min-h-[calc(100svh-var(--header-height))]">

            <DashboardSidebar />

            <SidebarInset>

                <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-stone-100 p-4">

                    <SidebarTrigger className="-ml-1" />

                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />

                    <Suspense fallback={null}>
                        <AppBreadcrumb />
                    </Suspense>

                </header>

                <main className="flex flex-1 flex-col gap-4 p-4">
                    <VerifyEmailBanner/>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

