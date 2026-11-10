// NavLinks.tsx
'use client'

import { cn } from "cn"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
    { label: "Catalogo", href: "/catalogo" },
    { label: "Vender", href: "/vender" },
    { label: "Nosotros", href: "/nosotros" },
]

export const NavLinks = () => {
    const pathname = usePathname()

    return (
        <nav className="flex h-full w-full divide-x divide-white/10 overflow-x-auto md:w-auto md:divide-x-0 md:overflow-visible">
            {NAV_LINKS.map(({ label, href }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`)

                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "group relative flex h-full flex-1 items-center justify-center px-3 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                            "sm:text-xs md:flex-none md:px-4 md:tracking-[0.18em]",
                            isActive
                                ? "bg-black/10 text-lime-400"
                                : "text-white hover:bg-lime-400/10 hover:text-lime-100",
                        )}
                    >
                        {label}
                        <span
                            aria-hidden
                            className={cn(
                                "absolute inset-x-0 bottom-0 h-0.5 origin-center bg-lime-400 transition-transform duration-300 ease-out md:h-1",
                                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                            )}
                        />
                    </Link>
                )
            })}
        </nav>
    )
}