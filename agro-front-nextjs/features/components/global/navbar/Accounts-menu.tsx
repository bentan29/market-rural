
'use client'

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/providers/AuthProvider"
import { cn } from "@/lib/utils"
import { DropdownLogged } from "./logged-menu/Dropdown-logged"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    UserCircleIcon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

const mobileItemClass = cn(
    "flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2.5",
    "text-sm text-foreground outline-none transition-colors",
    "hover:bg-muted focus:bg-muted data-highlighted:bg-muted"
)

export const Accountsmenu = () => {
    const { user, status } = useAuth()

    //- Estado de carga
    if (status === "loading") {
        return (
            <div className="flex items-center gap-2">
                <div className="hidden h-9 w-28 animate-pulse rounded-sm bg-white/10 md:block" />
                <div className="size-10 animate-pulse rounded-sm bg-white/10 md:hidden" />
            </div>
        )
    }

    //- Sesión activa
    if (user) {
        return (
            <div className="flex items-center">
                <DropdownLogged />
            </div>
        )
    }

    //- Sesión inactiva
    return (
        <>
            {/* Desktop */}
            <div className="hidden items-center gap-2 md:flex">
                <Link
                    href="/login"
                    className={cn(
                        buttonVariants(),
                        "h-9 rounded-sm bg-brand px-4 font-semibold text-brand-foreground shadow-none",
                        "hover:bg-brand-hover"
                    )}
                >
                    Iniciar sesión
                </Link>

                <Link
                    href="/registrarme"
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-9 rounded-sm border-white/30 bg-white/5 px-4 font-semibold text-white",
                        "hover:border-white/50 hover:bg-white/10 hover:text-white"
                    )}
                >
                    Crear cuenta
                </Link>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label="Abrir menú de cuenta"
                        className={cn(
                            "flex size-10 items-center justify-center rounded-sm",
                            "border border-white/15 bg-white/5 text-white",
                            "outline-none transition-colors",
                            "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand/60",
                            "data-popup-open:bg-white/10"
                        )}
                    >
                        <HugeiconsIcon
                            icon={UserCircleIcon}
                            size={23}
                        />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={10}
                        className="w-67.5 rounded-md border border-border/70 bg-popover p-1.5 text-popover-foreground shadow-2xl"
                    >
                        {/* Cabecera */}
                        <div className="rounded-sm bg-muted/60 p-3">
                            <p className="text-sm font-semibold">
                                Bienvenido a MarketRural
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Accedé a tu cuenta o registrate para comenzar.
                            </p>
                        </div>


                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                Mi cuenta
                            </DropdownMenuLabel>
                            
                            <DropdownMenuItem
                                render={<Link href="/login" />}
                                className={mobileItemClass}
                            >
                                <span className="flex size-9 items-center justify-center rounded-sm bg-muted">
                                    <HugeiconsIcon
                                        icon={UserCircleIcon}
                                        size={19}
                                        className="text-muted-foreground"
                                    />
                                </span>

                                <span className="flex-1 font-medium">
                                    Iniciar sesión
                                </span>

                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={16}
                                    className="text-muted-foreground"
                                />
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                render={<Link href="/registrarme" />}
                                className={cn(
                                    mobileItemClass,
                                    "focus:bg-brand/10 focus:text-foreground data-highlighted:bg-brand/10"
                                )}
                            >
                                <span className="flex size-9 items-center justify-center rounded-sm bg-brand/10">
                                    <HugeiconsIcon
                                        icon={UserCircleIcon}
                                        size={19}
                                        className="text-brand"
                                    />
                                </span>

                                <span className="flex-1 font-medium">
                                    Crear cuenta
                                </span>

                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={16}
                                    className="text-brand"
                                />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="mx-1 my-1.5 bg-border/60" />

                        <div className="px-2 py-2">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                ¿Tenés maquinaria para vender? Registrate y publicá tus equipos.
                            </p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
