import Lightfall from "@/components/Lightfall"

//- Mismo fondo animado del hero, entonado al teal de la marca
export const AuthBackground = () => (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Lightfall
            colors={["#ffffff"]}
            backgroundColor="#042f2e" // teal-950. Para igualar el hero exacto: "#94a3b8"
            speed={0.3}
            streakCount={2}
            streakWidth={0.8}
            twinkle={0.3}
            backgroundGlow={0.1}
            headGlow={0.6}
            bloom={0.35}
            mouseInteraction
            holdToWarp
            intro
            streakLength={1}
            density={0.6}
            glow={1}
            depth={0.5}
            zoom={3}
            mouseStrength={0.4}
            mouseRadius={0.45}
            lens={0.5}
            fade={0}
            lightMode={false}
        />
        {/* Fundido inferior, igual que el hero */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/50 to-transparent" />
    </div>
)