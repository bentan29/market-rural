
import TopographyBackground from "@/features/components/animations/Topography-background"
import { RegisterFormApp } from "@/features/components/auth/register/RegisterForm-App"

export default function RegistrarmePage() {
    return (
        <div className="relative flex min-h-[calc(100svh-var(--header-height))] items-center justify-center overflow-hidden bg-teal-950 p-6 md:p-10">
            <div className="absolute inset-0 z-0">
                <TopographyBackground />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <RegisterFormApp />
            </div>
        </div>
    )
}