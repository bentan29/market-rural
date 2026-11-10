'use server'

import { updateTag } from 'next/cache'
import { authFetch } from '@/lib/auth/server-fetch'
import { extractMessage, readJson } from '@/lib/http/response'
import type { ListingStatus } from '@/lib/types/listing.type'

export type ChangeStatusResult =
  | { ok: true }
  | { ok: false; status?: number; message: string }

export async function changeListingStatusAction(
  listingId: string,
  status: ListingStatus,
): Promise<ChangeStatusResult> {
  try {
    const res = await authFetch(`/listings/${encodeURIComponent(listingId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    const body = await readJson<{ message?: string | string[] }>(res)

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message:
          res.status === 401
            ? 'Tu sesión venció. Ingresá de nuevo.'
            : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
      }
    }

    //- Pausar, vender o publicar cambia lo que se ve en el catálogo público
    updateTag('listings')
    return { ok: true }
  } catch {
    return { ok: false, message: 'No se pudo conectar con el servidor' }
  }
}