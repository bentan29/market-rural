import 'server-only'
import { ListingsResponse } from "@/lib/types/listing.type"

const API = process.env.API_URL

export async function getMyFavoritesAction(): Promise<ListingsResponse> {

    const res = await fetch(`${API}/favorites/myFavorites`)
    if (!res.ok) throw new Error(`No se pudieron cargar los favoritos (${res.status})`)

    return (await res.json()) as ListingsResponse
}