
'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowDown01Icon,
    DashboardSquare01Icon,
    Logout01Icon,
    TractorIcon,
    SendIcon,
    UserCircleIcon,
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
    USER: "Cuenta personal",
    SELLER: "Vendedor",
    ADMIN: "Administrador",
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean)

    if (!parts.length) return "?"
    if (parts.length === 1) return parts[0][0].toUpperCase()

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const itemClass = cn(
    "group flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2.5",
    "text-sm text-foreground outline-none transition-all duration-150",
    "hover:bg-muted focus:bg-muted data-highlighted:bg-muted"
)

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
            {/* Trigger */}
            <DropdownMenuTrigger
                className={cn(
                    "group flex items-center gap-2.5 rounded-sm p-1.5",
                    "text-white outline-none transition-colors",
                    "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand/60",
                    "data-popup-open:bg-white/10"
                )}
            >
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand text-sm font-bold text-brand-foreground">
                    {initials}

                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-teal-800 bg-lime-400" />
                </span>

                <span className="hidden min-w-0 flex-col items-start sm:flex">
                    <span className="max-w-32 truncate text-sm font-semibold">
                        {displayName}
                    </span>

                    <span className="text-[11px] text-white/60">
                        {roleLabel}
                    </span>
                </span>

                <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={15}
                    className="text-white/50 transition-transform duration-200 group-data-popup-open:rotate-180"
                />
            </DropdownMenuTrigger>

            {/* Dropdown */}
            <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-72.5 overflow-hidden rounded-md border border-border/70 bg-popover p-1.5 text-popover-foreground shadow-2xl shadow-black/10"
            >
                {/* User header */}
                <div className="relative flex items-center gap-3 overflow-hidden rounded-sm bg-muted/60 p-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-brand text-base font-bold text-brand-foreground">
                        {initials}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-tight">
                            {displayName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {user.email}
                        </p>

                        <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                            <span className="size-1.5 rounded-full bg-brand" />
                            {roleLabel}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-2 pb-1 pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Espacio de trabajo
                    </p>
                </div>

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        render={<Link href="/dashboard" />}
                        className={itemClass}
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-muted transition-colors group-hover:bg-background">
                            <HugeiconsIcon
                                icon={DashboardSquare01Icon}
                                size={19}
                                className="text-muted-foreground"
                            />
                        </span>

                        <span className="flex-1 font-medium">
                            Mi panel
                        </span>
                    </DropdownMenuItem>

                    {user.role === "SELLER" && (
                        <DropdownMenuItem
                            render={<Link href="/dashboard/publicaciones" />}
                            className={itemClass}
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-muted transition-colors group-hover:bg-background">
                                <HugeiconsIcon
                                    icon={TractorIcon}
                                    size={19}
                                    className="text-muted-foreground"
                                />
                            </span>

                            <span className="flex-1 font-medium">
                                Mis publicaciones
                            </span>
                        </DropdownMenuItem>
                    )}

                    {user.role === "USER" && (
                        <DropdownMenuItem
                            render={<Link href="/dashboard/registro-vendedor" />}
                            className={itemClass}
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand/10 transition-colors group-hover:bg-brand/15">
                                <HugeiconsIcon
                                    icon={SendIcon}
                                    size={19}
                                    className="text-brand"
                                />
                            </span>

                            <span className="flex-1 font-medium">
                                Quiero vender
                            </span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="mx-1 my-1.5 bg-border/60" />

                {/* Logout */}
                <DropdownMenuItem
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2.5",
                        "text-sm text-muted-foreground outline-none transition-colors",
                        "hover:bg-destructive/5 hover:text-destructive",
                        "focus:bg-destructive/5 focus:text-destructive",
                        "data-highlighted:bg-destructive/5 data-highlighted:text-destructive"
                    )}
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-muted">
                        <HugeiconsIcon
                            icon={Logout01Icon}
                            size={19}
                        />
                    </span>

                    <span className="font-medium">
                        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
