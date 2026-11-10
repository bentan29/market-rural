import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import type { ListingsResponse } from '@/lib/types/listing.type'

const API = process.env.API_URL

export type ListingsFilters = Record<string, string | number | readonly string[] | null | undefined>

//- Filtros -> query string. Los nombres de los filtros son los mismos que los del DTO de Nest
function toQueryString(filters: ListingsFilters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)))
    else if (value !== null && value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

//- Next arma la clave de caché con los argumentos: cada combinación de filtros se cachea por separado
export async function getListingsAction(filters: ListingsFilters = {}): Promise<ListingsResponse> {
  'use cache'
  cacheLife('minutes') // tolera unos minutos de atraso
  cacheTag('listings') // las acciones de publicar, cancelar y reactivar lo invalidan con updateTag

  const qs = toQueryString(filters)
  const res = await fetch(`${API}/listings/catalog${qs ? `?${qs}` : ''}`)

  //- Se LANZA el error (no se devuelve): así un fallo no queda guardado en el caché
  if (!res.ok) throw new Error(`No se pudo cargar el catálogo (${res.status})`)

  return (await res.json()) as ListingsResponse
}