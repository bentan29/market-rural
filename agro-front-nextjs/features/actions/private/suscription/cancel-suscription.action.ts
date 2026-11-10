'use server'

import { authFetch } from "@/lib/auth/server-fetch";
import { updateTag } from "next/cache";

type CancelResult =
  | { ok: true }
  | { ok: false; status?: number; message: string }

export async function cancelSuscriptionAction(): Promise<CancelResult> {

    try {
        const res = await authFetch('/subscription/cancel', { method: 'POST' })

        if(!res.ok) {
            const isJson = res.headers.get('content-type')?.includes('application/json')
            const body = isJson ? await res.json().catch(() => null) : null
            const message = Array.isArray(body?.message) ? body.message[0] : body?.message

            return {
                ok: false,
                status: res.status,
                message: res.status === 401
                ? 'Tu sesión venció. Ingresá de nuevo.'
                : (message ?? `El servidor respondió ${res.status}`),
            }
        }

        //* updateTag() es una función de Next.js que permite invalidar 
        //* inmediatamente una caché para que la próxima lectura obtenga datos actualizados.
        //- Sus publicaciones dejan de verse en público: que el catálogo cacheado se actualice
        updateTag('listings')
        return { ok: true }


    } catch {
        return { ok: false, message: 'No se pudo conectar con el servidor' }
    }
    
}