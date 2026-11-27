import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { CATALOG_COUNTRIES } from "@/features/constants/catalog/countries"
import { cn } from "@/lib/utils"
import { TopographyBackground } from "../../animations/Topography-background"

const ACTIONS = [
    {
        index: "01",
        href: "/catalogo",
        eyebrow: "Quiero comprar",
        title: "Ver catálogo",
        description: "Tractores, cosechadoras y equipos, en venta y alquiler.",
        primary: true,
    },
    {
        index: "02",
        href: "/vender",
        eyebrow: "Quiero vender",
        title: "Vender mi maquinaria",
        description: "Llegá a compradores de toda la región.",
        primary: false,
    },
] as const

//- Marcas de esquina del panel (decorativas)
const CORNERS = [
    "-top-px -left-px border-t-2 border-l-2",
    "-top-px -right-px border-t-2 border-r-2",
    "-bottom-px -left-px border-b-2 border-l-2",
    "-right-px -bottom-px border-r-2 border-b-2",
] as const

//- La foto se funde con el fondo por la izquierda, arriba y abajo: así deja ver las curvas en vez de taparlas
const TRACTOR_MASK =
    "linear-gradient(to right, transparent 15%, black 75%), linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%)"

const monoLabel = "font-mono text-[10px] uppercase tracking-[0.25em] text-white/45"

export const BannerHomeApp = () => {
    return (
        //- Alto mínimo (no fijo): en el celular el contenido es más largo y la sección tiene que poder crecer
        //- --header-height viene del layout de (site)
        <section className="relative isolate flex min-h-[min(720px,calc(100svh-var(--header-height)))] w-full overflow-hidden bg-teal-950">

            {/* 1. Fondo: en escritorio el efecto vivo; en el celular, la captura */}
            <div className="absolute inset-0 z-0">
                <TopographyBackground />
            </div>

            {/* 2. Tractor: más tenue que antes, para que el fondo se vea a través */}
            <Image
                src="/images/banner/tractor3.png"
                alt="Tractor trabajando en el campo al atardecer"
                fill
                priority
                sizes="100vw"
                className="pointer-events-none z-10 object-cover object-[65%_center] opacity-40 md:opacity-80"
                style={{
                    maskImage: TRACTOR_MASK,
                    maskComposite: "intersect",
                    WebkitMaskImage: TRACTOR_MASK,
                    WebkitMaskComposite: "source-in",
                }}
            />

            {/* 3. Velo: asegura que el texto se lea. Más suave que antes, para que no apague el fondo */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-linear-to-b from-teal-950/60 via-teal-950/30 to-teal-950/75 lg:bg-linear-to-r lg:from-teal-950/75 lg:via-teal-950/25 lg:to-transparent" />

            {/* 4. Fundido inferior hacia el fondo de la página */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-linear-to-t from-black/50 to-transparent" />

            {/* 5. Contenido: texto a la izquierda, panel de acciones a la derecha (debajo en pantallas chicas) */}
            <div className="relative z-30 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-12 text-white md:px-16 md:py-16 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16">

                <div className="flex flex-col gap-6">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.3em] text-white/65">
                        <span aria-hidden className="h-px w-10 bg-lime-400" />
                        MarketRural
                        <span aria-hidden className="text-white/30">/</span>
                        Marketplace de maquinarias
                    </p>

                    <h1 className="max-w-2xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                        Toda la maquinaria rural,{" "}
                        <span className="text-lime-400">en un solo lugar.</span>
                    </h1>

                    <p className="max-w-xl text-base text-white/75 md:text-xl">
                        Comprá, vendé o alquilá tractores, cosechadoras y equipos
                        agrícolas de forma simple y segura.
                    </p>

                    {/* Datos al pie, como una ficha */}
                    <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-5">
                        <div className="space-y-1">
                            <dt className={monoLabel}>Mercados</dt>
                            <dd className="font-mono text-sm tracking-[0.15em]">
                                {CATALOG_COUNTRIES.map((country) => country.code).join(" · ")}
                            </dd>
                        </div>
                        <div className="space-y-1">
                            <dt className={monoLabel}>Operaciones</dt>
                            <dd className="font-mono text-sm tracking-[0.15em]">Venta · Alquiler</dd>
                        </div>
                    </dl>
                </div>

                <nav aria-label="Acciones principales" className="w-full max-w-xl lg:max-w-none">
                    <p className={cn(monoLabel, "mb-3 flex items-center gap-3")}>
                        <span aria-hidden className="h-px w-8 bg-lime-400" />
                        Empezá acá
                    </p>

                    <div className="relative">
                        {CORNERS.map((position) => (
                            <span
                                key={position}
                                aria-hidden
                                className={cn("pointer-events-none absolute z-10 size-3 border-lime-400", position)}
                            />
                        ))}

                        <ul className="divide-y divide-white/15 border border-white/20 bg-teal-950/60 backdrop-blur-md">
                            {ACTIONS.map(({ index, href, eyebrow, title, description, primary }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className={cn(
                                            "group flex min-h-28 items-center gap-4 p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-inset md:p-6",
                                            primary
                                                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                                                : "text-white hover:bg-white/10",
                                        )}
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "self-start font-mono text-xs tabular-nums",
                                                primary ? "text-brand-foreground/60" : "text-lime-400",
                                            )}
                                        >
                                            {index}
                                        </span>

                                        <span className="min-w-0 flex-1 space-y-1">
                                            <span
                                                className={cn(
                                                    "block text-[11px] font-semibold uppercase tracking-[0.2em]",
                                                    primary ? "text-brand-foreground/70" : "text-white/55",
                                                )}
                                            >
                                                {eyebrow}
                                            </span>
                                            <span className="block text-xl font-bold leading-tight md:text-2xl">{title}</span>
                                            <span className={cn("block text-sm", primary ? "text-brand-foreground/80" : "text-white/65")}>
                                                {description}
                                            </span>
                                        </span>

                                        <HugeiconsIcon
                                            icon={ArrowUpRight01Icon}
                                            size={26}
                                            strokeWidth={1.6}
                                            className="shrink-0"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </div>
        </section>
    )
}