'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "./AuthProvider"
import { apiFetch } from "@/lib/api"

type FavoritesContextValue = {
    isFavorite: (listingId: string) => boolean
    setFavorite: (listingId: string, value: boolean) => void
    favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoriteProvider({children}: {children: React.ReactNode}) {

    const {user} = useAuth()
    const userId = user?.id
    const [ids, setIds] = useState<ReadonlySet<string>>(new Set())

    //- Una sola consulta por sesión: todas las tarjetas leen de acá
    useEffect(() => {
        if (!userId) {
            setIds(new Set())
            return
        }

        let cancelled = false

        apiFetch("/favorites/ids")
            .then((res) => (res.ok ? res.json() : []))
            .then((list: string[]) => {
                if (!cancelled) setIds(new Set(list))
            })
            .catch(() => {}) // sin la lista, los corazones se ven vacíos: no es grave

        return () => {
            cancelled = true
        }
    }, [userId])

    const isFavorite = useCallback(
        (id: string) => ids.has(id), 
        [ids]
    )

    const setFavorite = useCallback((id: string, value: boolean) => {
        setIds((prev) => {
            const next = new Set(prev)
            if (value) next.add(id)
            else next.delete(id)
            return next
        })
    }, [])

    //- Cantidad total de favoritos
    const favoritesCount = ids.size

    const value = useMemo(
        () => ({ isFavorite, setFavorite, favoritesCount }), 
        [isFavorite, setFavorite, favoritesCount]
    )

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext)
    if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>")
    return ctx
}