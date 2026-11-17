import { FooterApp } from "@/features/components/global/footer/Footer-App";

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-1 flex-col">
            {children}
            <FooterApp />
        </div>
    );
}