// GlobalNavBar.tsx
import Link from "next/link"
import { NavLinks } from "./NavLinks"
import { Accountsmenu } from "./Accounts-menu"
import { Suspense } from "react"

export const GlobalNavBar = () => {
    return (
        <header
            className="
                sticky top-0 z-50 w-full bg-linear-to-r from-[#022f2b] via-[#075e54] to-[#087c70] backdrop-blur-md
                grid grid-cols-[1fr_auto] shadow-md shadow-black/30
                md:flex md:h-(--header-height) md:items-center md:justify-between md:px-8
            "
        >
            {/* Logo */}
            <Link
                href="/"
                className="flex h-14 items-center px-4 text-lg font-bold md:order-1 md:h-auto md:px-0"
            >
                <span className="text-white">MARKET</span>
                <span className="text-lime-300">RURAL</span>
            </Link>

            {/* Cuentas */}
            <div className="flex h-14 items-center px-4 md:order-3 md:h-auto md:px-0">
                <Accountsmenu />
            </div>

            {/* Links: segundo renglón a todo el ancho en móvil, centro en desktop */}
            <div
                className="
                    col-span-2 h-11 border-t border-white/10
                    md:order-2 md:col-auto md:mx-8 md:h-full md:border-t-0
                "
            >
                <Suspense fallback={<div aria-hidden className="h-full min-h-10 w-full md:w-72" />}>
                    <NavLinks />
                </Suspense>
            </div>
        </header>
    )
}