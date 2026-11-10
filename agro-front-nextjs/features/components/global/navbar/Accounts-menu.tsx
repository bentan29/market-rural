'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/features/providers/AuthProvider"
import { cn } from "@/lib/utils"
import { DropdownLogged } from "./logged-menu/Dropdown-logged"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"

export const Accountsmenu = () => {

    const { user, status } = useAuth()


    if (status === 'loading') return <div className="h-8 w-24 rounded-sm bg-white/10" />

    if (user) {
        return (
            <div className="flex items-center gap-2">
                <DropdownLogged/>
            </div>
        )
    }

    return (
        <>
            {/* Pantallas grandes */}
            <div className="hidden md:flex gap-1">
                <Link
                    href="/login"
                    className={cn(
                        buttonVariants(),
                        "rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover"
                    )}
                >
                    Iniciar sesión
                </Link>

                <Link
                    href="/registrarme"
                    className={cn(buttonVariants({ variant: "secondary" }), "rounded-sm")}
                    >
                    Registrarme
                </Link>
            </div>

            <DropdownMenu >
                <DropdownMenuTrigger  className="md:hidden text-secondary bg-lime-300/10 p-1.5 rounded-md">
                    <HugeiconsIcon icon={UserCircleIcon} size="25"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                    <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
                    <DropdownMenuItem >Iniciar Session</DropdownMenuItem>
                    <DropdownMenuItem>Registrarme</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}