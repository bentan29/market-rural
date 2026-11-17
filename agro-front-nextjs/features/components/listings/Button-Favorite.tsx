'use client'

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/providers/AuthProvider"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import { useState } from "react"
import { AlertDialogApp } from "../global/alertDialog/AlertDialogApp"
import { toggleFavoriteAction } from "@/features/actions/public/favorites/toggle-favorite.action"
import { useFavorites } from "@/features/providers/FavoritesProvider"

interface Props {
    listingId: string
    className?: string
}


export const ButtonFavorite = ({listingId, className} : Props) => {

    const { user, status } = useAuth()
    const { isFavorite, setFavorite } = useFavorites()
    const favorite = isFavorite(listingId)

    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const [loginHref, setLoginHref] = useState("/login")

    const handleFavorite = async() => {
        //- Todavía no sabemos si hay sesión: no mostramos el aviso de "iniciá sesión" por error
        if (status === "loading") return

        if (!user) {
            //- Se lee al hacer clic (no con usePathname, que obligaría a envolver cada tarjeta en Suspense)
            const here = window.location.pathname + window.location.search
            setLoginHref(`/login?next=${encodeURIComponent(here)}`)
            setShowLoginDialog(true)
            return
        }
        
        //- Primero se actualiza la pantalla y después se guarda; si falla, se revierte
        const next = !favorite
        setFavorite(listingId, next)

        try {
            const res = await toggleFavoriteAction(listingId)

            if(!res.ok) {
                // setFavorite(listingId, !next)
                toast.add({ 
                    type: "error", 
                    description: res.message
                })
                return
            }

            setFavorite(listingId, next)

            toast.add({
                type: 'success',
                description: res.message,
            })

        } catch {
            setFavorite(listingId, !next)
            toast.add({ 
                type: "error", 
                description: "error en el servidor" 
            })
        }
    }

    return (
        <>
            {/* Alert Dialog */}
            <AlertDialogApp
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
                icon={FavouriteIcon}
                title="Iniciá sesión para continuar"
                description="Necesitás una cuenta para guardar máquinas en favoritos."
                href={loginHref}
                actionLabel="Iniciar sesión"
            />

            {/* Boton Favorito */}
            <Button
                type="button"
                onClick={handleFavorite}
                aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                aria-pressed={favorite}
                className={cn(
                    favorite ? 'bg-red-100' : 'bg-white/90',
                    'absolute right-3 top-3 grid size-8 place-items-center rounded-sm  text-stone-900 backdrop-blur transition-colors hover:bg-white'
                )}
            >
                <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={16}
                    strokeWidth={1.8}
                    className={cn("transition-colors", favorite && "fill-orange-600 text-orange-600")}
                />
            </Button>
        </>
    )
}
