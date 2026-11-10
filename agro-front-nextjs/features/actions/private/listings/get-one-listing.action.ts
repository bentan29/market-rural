import 'server-only'
import { serverGet } from '@/lib/auth/server-get'
import { extractMessage, readJson } from '@/lib/http/response'
import type { MyListingDetail } from '@/lib/types/listing.type'

export type MyListingResult =
  | { ok: true; listing: MyListingDetail }
  | { ok: false; status: number; message: string }

//- Obtenemos el listing que queremos editar
export async function getMyListingAction(id: string): Promise<MyListingResult> {
  try {
    const res = await serverGet(`/listings/myListing/${encodeURIComponent(id)}`)
    const body = await readJson<MyListingDetail & { message?: string | string[] }>(res)

    if (!res.ok || !body) {
      return {
        ok: false,
        status: res.status,
        message:
          res.status === 401 ? 'Tu sesión venció. Ingresá de nuevo.'
          : res.status === 404 ? 'Publicación no encontrada.'
          : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
      }
    }

    return { ok: true, listing: body }
  } catch (error) {
    console.error('getMyListing:', error)
    return { ok: false, status: 0, message: 'No se pudo conectar con el servidor' }
  }
}