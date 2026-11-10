import { GlobalNavBar } from "@/features/components/global";

export default function SiteLayout({children}: {children: React.ReactNode}) {
    return (
        <section>
            <GlobalNavBar/>
            {children}
        </section>
    );
}