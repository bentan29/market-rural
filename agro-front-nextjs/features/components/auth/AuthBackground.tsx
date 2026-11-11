
import { LightfallBackground } from "../animations/LightfallBackground"

//- Mismo fondo animado del hero, entonado al teal de la marca
export const AuthBackground = () => (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>

        <LightfallBackground />

        {/* Fundido inferior, igual que el hero */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/50 to-transparent" />
    </div>
)