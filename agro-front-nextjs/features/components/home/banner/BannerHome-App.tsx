import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Lightfall from "@/components/Lightfall"

export const BannerHomeApp = () => {
    return (
        <section className="relative h-[min(680px,calc(100svh-64px))] min-h-135 w-full overflow-hidden bg-teal-950 md:min-h-150">
            {/* 1. Animación de fondo */}
            <div className="absolute inset-0 z-0">
                <Lightfall
                    colors={["#ffffff"]}
                    backgroundColor="#94a3b8"
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
            </div>

            {/* 2. Tractor con desvanecimiento hacia la izquierda */}
            <Image
                src="/images/banner/tractor3.png"
                alt="Tractor trabajando en el campo al atardecer"
                fill
                priority
                sizes="100vw"
                className="
                    pointer-events-none z-10
                    object-cover object-[65%_center]
                    opacity-70
                    mask-[linear-gradient(to_right,transparent_10%,black_70%)]
                    md:opacity-100
                "
            />

            {/* 3. Fundido inferior hacia el fondo de la página */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-linear-to-t from-black/50 to-transparent" />

            {/* 4. Contenido */}
            <div className="relative z-30 mx-auto flex h-full w-full max-w-7xl flex-col justify-center gap-6 px-6 text-white md:px-16">
                <span className="w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                    MarketRural · <span className="bg-brand py-0.5 px-2 text-white rounded-xs">Marketplace de maquinarias</span>
                </span>

                <h1 className="max-w-2xl text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
                    Toda la maquinaria rural,{" "}
                    <span className="text-lime-400">en un solo lugar.</span>
                </h1>

                <p className="max-w-xl text-lg text-white/75 md:text-xl">
                    Comprá, vendé o alquilá tractores, cosechadoras y equipos
                    agrícolas de forma simple y segura.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                        size="lg"
                        className="bg-brand text-brand-foreground hover:bg-brand-hover"
                    >
                        <Link href="/catalogo">Ver catálogo</Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                    >
                        <Link href="/vender">Vender mi maquinaria</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}