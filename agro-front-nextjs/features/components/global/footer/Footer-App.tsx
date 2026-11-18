import Link from "next/link"
import { cacheLife } from "next/cache"
import { CATALOG_COUNTRIES } from "@/features/constants/catalog/countries"

//- Completalo cuando tengas el correo del proyecto: mientras sea null, no se muestra
const CONTACT_EMAIL: string | null = null

type FooterLink = { label: string; href: string }

//- Los países salen de la misma constante que el catálogo: al sumar uno, el footer lo toma solo
const COLUMNS: { title: string; links: FooterLink[] }[] = [
    {
        title: "Comprar",
        links: [
        { label: "Todo el catálogo", href: "/maquinarias" },
        ...CATALOG_COUNTRIES.map((country) => ({
            label: `Maquinaria en ${country.name}`,
            href: `/maquinarias/${country.slug}`,
        })),
        ],
    },
    {
        title: "Vender",
        links: [
        { label: "Vender mi maquinaria", href: "/vender" },
        { label: "Mi panel", href: "/dashboard" },
        { label: "Mis publicaciones", href: "/dashboard/publicaciones" },
        ],
    },
    {
        title: "Cuenta",
        links: [
        { label: "Ingresar", href: "/login" },
        { label: "Crear cuenta", href: "/registrarme" },
        ],
    },
    {
        title: "Legal",
        links: [
        { label: "Términos y condiciones", href: "/terminos" },
        { label: "Privacidad", href: "/privacidad" },
        ],
    },
    ]

    //- Con Cache Components, leer la fecha actual en un Server Component exige cachearla o darle un Suspense
async function CopyrightYear() {
    "use cache"
    cacheLife("days")

    return <>{new Date().getFullYear()}</>
    }

const linkClass =
    "text-white/70 underline-offset-4 outline-none transition-colors hover:text-white focus-visible:text-lime-300 focus-visible:underline"

export function FooterApp() {
    return (
        <footer className="relative z-20 border-t border-white/10 bg-teal-950 text-white">
            {/* Trazo lima sobre el borde superior */}
            <span
                aria-hidden
                className="absolute top-0 left-6 h-px w-24 -translate-y-px bg-lime-400 md:left-16"
            />

            <div className="mx-auto w-full max-w-7xl px-6 md:px-16">

                {/* Cierre: la misma frase del hero y las dos acciones principales */}
                <div className="flex flex-col gap-8 border-b border-white/10 py-12 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <span className="block w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                            MarketRural
                        </span>
                        <p className="max-w-xl text-balance text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
                            Toda la maquinaria rural,{" "}
                            <span className="text-lime-400">en un solo lugar.</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/maquinarias"
                            className="inline-flex h-11 items-center rounded-sm bg-brand px-6 text-sm font-semibold text-brand-foreground outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-lime-400/60"
                        >
                            Ver catálogo
                        </Link>
                        <Link
                            href="/vender"
                            className="inline-flex h-11 items-center rounded-sm border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-lime-400/60"
                        >
                            Vender mi maquinaria
                        </Link>
                    </div>
                </div>

                {/* Columnas numeradas, como en los filtros */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4">
                    {COLUMNS.map((column, index) => (
                        <nav key={column.title} aria-label={column.title}>
                            <h2 className="flex items-center gap-3">
                                <span className="font-mono text-[10px] tabular-nums text-lime-400">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                                    {column.title}
                                </span>
                            </h2>

                            <ul className="mt-5 space-y-3 text-sm">
                                {column.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={linkClass}>
                                    {link.label}
                                    </Link>
                                </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                {/* Barra final */}
                <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
                    <p>
                        © <CopyrightYear /> MarketRural. Todos los derechos reservados.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {CONTACT_EMAIL && (
                            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                                {CONTACT_EMAIL}
                            </a>
                        )}

                        <p className="font-mono tracking-[0.2em]" aria-label="Mercados">
                            {CATALOG_COUNTRIES.map((country) => country.code).join(" · ")}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}