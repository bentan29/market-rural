import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader";

export default function MensajesPage() {
    return (
        <div className="flex flex-col gap-8">
            <DashboardPageHeader
                title="Mensajes"
                subtitle="Lista de mensajes"
            />
        </div>
    );
}