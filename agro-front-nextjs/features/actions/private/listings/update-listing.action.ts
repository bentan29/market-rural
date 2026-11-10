'use server'

import { updateTag } from 'next/cache'
import { authFetch } from '@/lib/auth/server-fetch'
import { extractMessage, readJson } from '@/lib/http/response'
import type { CreateListingPayload } from '@/features/schemas/listings/listing.schema'

export type UpdateListingResult =
    | { ok: true }
    | { ok: false; status?: number; message: string }

//- Editamos, actualizamos la publicacion
export async function updateListingAction(
    listingId: string,
    values: CreateListingPayload,
): Promise<UpdateListingResult> {
    //- Quita lo que no se completó, pero en una edición vaciar un opcional significa quitarlo (null)
    const payload = {
        ...Object.fromEntries(
            Object.entries(values).filter(([, v]) => v !== undefined && v !== null && v !== ''),
        ),
        hours: values.hours ?? null,
        horsepower: values.horsepower ?? null,
    }

    try {
        const res = await authFetch(`/listings/${encodeURIComponent(listingId)}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        })
        const body = await readJson<{ message?: string | string[] }>(res)

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                message:
                res.status === 401
                    ? 'Tu sesión venció. Ingresá de nuevo.'
                    : (extractMessage(body) ?? 'No pudimos guardar los cambios.'),
            }
        }

        updateTag('listings')
        return { ok: true }
    } catch {
        return { ok: false, message: 'No pudimos conectar con el servidor. Probá de nuevo.' }
    }
}