'use server'

import { authFetch } from "@/lib/auth/server-fetch";
import { extractMessage, readJson } from "@/lib/http/response";
import { updateTag } from "next/cache";

export type FeatureResult =
    | {ok: true}
    | {ok: false; status?: number; message: string}


//- Funcion reutilizable
async function call(listingId: string, method: 'POST' | 'DELETE'): Promise<FeatureResult> {
    try {
        const res = await authFetch(`/listings/${encodeURIComponent(listingId)}/feature`, {method})
        const body = await readJson<{message?: string | string[]}>(res)

        if(!res.ok) {
            return {
                ok: false,
                status: res.status,
                message: 
                    res.status === 401
                        ? 'Tu sesión venció, Ingresa de nuevo.'
                        : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
            }
        }

        //- El orden y la insignia del catálogo público cambian
        updateTag('listings')
        return { ok: true }
    } catch {
        return { 
            ok: false, 
            message: 'No se pudo conectar con el servidor', 
        }
    }
}


//? --- Agregamos puclicacion destacada
export async function featureListingAction(listingId: string) {
  return call(listingId, 'POST')
}


//? --- Quitamos publicacion destacada
export async function unfeatureListingAction(listingId: string) {
  return call(listingId, 'DELETE')
}