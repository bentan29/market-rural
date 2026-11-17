'use server'

import { authFetch } from "@/lib/auth/server-fetch"
import { extractMessage } from "@/lib/http/response"

export type ToggleFavoriteResult =
    | { ok: true; message: string; isFavorite: boolean }
    | { ok: false; status?: number; message: string }

    
export async function toggleFavoriteAction(listingId: string): Promise<ToggleFavoriteResult> {

    try {
        
        const res = await authFetch('/favorites/toggle', {
            method: "POST",
            body: JSON.stringify({listingId})
        })

        if(!res.ok) {
            return {
                ok: false,
                status: res.status,
                message:
                res.status === 401
                    ? "Tu sesión venció. Ingresá de nuevo."
                    : (extractMessage(res) ?? "No pudimos crear la publicación."),
            }
        }
        
        const data: { isFavorite: boolean } = await res.json()

        return {
            ok: true,
            message: data.isFavorite
                ? 'Se ha agregado a favoritos'
                : 'Se ha quitado de favoritos',
            isFavorite: data.isFavorite,
        }

    } catch {
        return {
            ok: false,
            message: "No pudimos conectar con el servidor. Probá de nuevo.",
        }
    }

}