'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowDown01Icon,
    Home05Icon,
    Logout01Icon,
    SendIcon,
    TractorIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useAuth } from "@/features/providers/AuthProvider"
import type { SessionUser } from "@/lib/types/auth.type"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROLE_LABEL: Record<SessionUser["role"], string> = {
    USER: "Usuario",
    SELLER: "Vendedor",
    ADMIN: "Administrador",
}

//- "Juan Pérez" -> "JP", "juan@mail.com" -> "J"
function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

//- Base UI marca el item resaltado con data-highlighted; los focus: cubren otras variantes
const itemClass =
    "cursor-pointer gap-2.5 rounded-sm px-2.5 py-2 text-sm text-white/85 focus:bg-white/10 focus:text-white data-highlighted:bg-white/10 data-highlighted:text-white"

const iconClass = "shrink-0 text-white/60"

export const DropdownLogged = () => {

    const { user, logout } = useAuth()

    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const onLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)

        try {
            await logout()
            router.replace("/")
            router.refresh()
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (!user) return null

    const displayName = user.fullName ?? user.email
    const initials = getInitials(displayName)
    const roleLabel = ROLE_LABEL[user.role]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "group flex items-center gap-2.5 rounded-sm border border-white/15 bg-white/10 py-1 pr-2.5 pl-1 text-white outline-none transition-colors",
                    "hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-brand/60",
                    "data-popup-open:bg-white/15 data-[state=open]:bg-white/15"
                )}
            >
                <span className="flex size-8 items-center justify-center rounded-sm bg-brand text-xs font-bold text-brand-foreground">
                    {initials}
                </span>

                <span className="hidden min-w-0 flex-col text-left leading-tight sm:flex">
                    <span className="max-w-32 truncate text-sm font-medium">{displayName}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-400">
                        {roleLabel}
                    </span>
                </span>

                <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={16}
                    className="text-white/60 transition-transform duration-200 group-data-popup-open:rotate-180 group-data-[state=open]:rotate-180"
                />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-64 rounded-sm border border-white/15 bg-teal-950 p-1 text-white shadow-2xl ring-0"
            >
                {/* Cabecera: quién está logueado */}
                <div className="flex items-center gap-3 border-b border-white/10 p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand text-sm font-bold text-brand-foreground">
                        {initials}
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{displayName}</p>
                        <p className="truncate text-xs text-white/60">{user.email}</p>
                        <span className="mt-1.5 inline-block rounded-xs bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-foreground">
                            {roleLabel}
                        </span>
                    </div>
                </div>

                <DropdownMenuGroup className="py-1">

                    <DropdownMenuItem render={<Link href="/dashboard" />} className={itemClass}>
                        <HugeiconsIcon icon={Home05Icon} size={18} className={iconClass} />
                        Mi panel
                    </DropdownMenuItem>

                    {/* Según el rol: el vendedor gestiona publicaciones, el usuario puede pasar a vender */}
                    {user.role === "SELLER" && (
                        <DropdownMenuItem render={<Link href="/dashboard/publicaciones" />} className={itemClass}>
                            <HugeiconsIcon icon={TractorIcon} size={18} className={iconClass} />
                            Mis publicaciones
                        </DropdownMenuItem>
                    )}

                    {user.role === "USER" && (
                        <DropdownMenuItem render={<Link href="/dashboard/registro-vendedor" />} className={itemClass}>
                            <HugeiconsIcon icon={SendIcon} size={18} className="shrink-0 text-lime-400" />
                            Quiero vender
                        </DropdownMenuItem>
                    )}

                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuGroup className="pt-1">

                    {/* Base UI usa onClick; onSelect es de Radix y acá se ignora */}
                    <DropdownMenuItem
                        onClick={onLogout}
                        disabled={isLoggingOut}
                        className="cursor-pointer gap-2.5 rounded-sm px-2.5 py-2 text-sm text-red-300 focus:bg-red-500/10 focus:text-red-200 data-highlighted:bg-red-500/10 data-highlighted:text-red-200"
                    >
                        <HugeiconsIcon icon={Logout01Icon} size={18} className="shrink-0" />
                        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                    </DropdownMenuItem>

                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}