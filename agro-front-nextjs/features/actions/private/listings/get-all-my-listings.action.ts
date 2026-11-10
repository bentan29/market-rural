import 'server-only'

import { serverGet } from '@/lib/auth/server-get'
import { extractMessage, readJson } from '@/lib/http/response'
import { ListingType } from '@/lib/types/listing.type';

export type MyListingsResponse = {
  items: ListingType[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type MyListingsFilters = {
  q?: string
  status?: readonly string[]
  operation?: readonly string[]
  sort?: string
  page?: number
}

export type MyListingsResult =
  | { ok: true; data: MyListingsResponse }
  | { ok: false; status: number; message: string }

function toQuery(filters: MyListingsFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  filters.status?.forEach((s) => params.append('status', s))
  filters.operation?.forEach((o) => params.append('operation', o))
  if (filters.sort) params.set('sort', filters.sort)
  params.set('page', String(filters.page ?? 1))
  return params.toString()
}

//? --- Lectura al renderizar: serverGet NO refresca (proxy.ts ya renovó la sesión antes)
export async function getallMyListingsAction(filters: MyListingsFilters = {}): Promise<MyListingsResult> {
  
  if (!process.env.API_URL) {
    return { 
      ok: false, status: 500, 
      message: 'Falta API_URL en las variables de entorno' 
    }
  }

  try {
    const res = await serverGet(`/listings/myListings?${toQuery(filters)}`)
    const body = await readJson<MyListingsResponse & { message?: string | string[] }>(res)

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message:
          res.status === 401 ? 'Tu sesión venció. Ingresá de nuevo.'
          : res.status === 403 ? 'No sos un vendedor.'
          : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
      }
    }

    if (!body) {
      return {
        ok: false, 
        status: res.status, 
        message: 'El servidor respondió algo inesperado.'
      }
    }

    return { 
      ok: true, 
      data: body 
    }
  } catch (error) {
    console.error('getMyListings:', error)
    return { ok: false, status: 0, message: 'No se pudo conectar con el servidor' }
  }
}