import { CreateListingContainer } from "@/features/components/dashboard/listings/form/CreateListing-container";
import { DashboardPageHeader } from "@/features/components/global/header/DashboardPageHeader";

export default function CrearPublicacionPage() {

    return (
        <div className="flex flex-col gap-8">

            <DashboardPageHeader title="Nueva Publicacion"/>

            {/* Formulario */}
            <div className="max-w-2xl mx-auto w-full">
                <CreateListingContainer/>
            </div>
           
        </div>
    );
}