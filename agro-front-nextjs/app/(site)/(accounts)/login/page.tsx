import { ContourLayer, TopographyBackground } from "@/features/components/animations/Topography-background";
import { AuthBackground } from "@/features/components/auth/AuthBackground";
import { LoginFormApp } from "@/features/components/auth/login/LoginForm-App";

export default function LoginPage() {
    return (
        <div className="relative flex min-h-[calc(100svh-var(--header-height))] items-center justify-center overflow-hidden bg-teal-950 p-6 md:p-10">
            {/* <AuthBackground /> */}

            <div className="absolute inset-0 z-0">
                <TopographyBackground />
            </div>

            {/* 2b. Curvas de nivel del celular: ENCIMA de la foto (si no, la foto las tapa) y debajo del velo */}
            <ContourLayer className="z-15 md:hidden" />
        
            <div className="relative z-10 w-full max-w-md">
                <LoginFormApp />
            </div>
        </div>
    );
}