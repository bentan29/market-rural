import "server-only"
import { serverGet } from "@/lib/auth/server-get"
import { extractMessage, readJson } from "@/lib/http/response"
import type { ListingType } from "@/lib/types/listing.type"

type FavoritesPage = {
    items: ListingType[]
    total: number
    page: number
    totalPages: number
}

export type MyFavoritesResult =
    | ({ ok: true } & FavoritesPage)
    | { ok: false; status: number; message: string }

//- Lectura de datos (no es un Server Action): sin "use server"
export async function getMyFavorites(limit = 8, page = 1): Promise<MyFavoritesResult> {
    try {
        const res = await serverGet(`/favorites/myFavorites?page=${page}&limit=${limit}`)
        const body = await readJson<FavoritesPage & { message?: string | string[] }>(res)

        if (!res.ok || !body) {
            return {
                ok: false,
                status: res.status,
                message:
                    res.status === 401 ? "Tu sesión venció. Ingresá de nuevo."
                        : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
            }
        }

        return {
            ok: true,
            items: body.items,
            total: body.total,
            page: body.page,
            totalPages: body.totalPages,
        }
    } catch (error) {
        console.error("getMyFavorites:", error)
        return { ok: false, status: 0, message: "No se pudo conectar con el servidor" }
    }
}