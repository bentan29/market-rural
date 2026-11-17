import { GlobalNavBar } from "@/features/components/global";

export default function SiteLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex min-h-svh flex-col [--header-height:calc(--spacing(16))]">
            <GlobalNavBar />
            
            {children}
        </div>
    );
}