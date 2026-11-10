import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { PublicSeller } from '@/lib/types/seller.type'

const API = process.env.API_URL

//- Pública: va con caché (sin cookies). Devuelve null si no existe o está dado de baja
export async function getPublicSeller(slug: string): Promise<PublicSeller | null> {
  'use cache'
  cacheLife('hours')
  cacheTag('sellers', `seller-${slug}`)

  const res = await fetch(`${API}/seller/public/${encodeURIComponent(slug)}`)

  if (res.status === 404) return null
  //- Se lanza (no se devuelve): un fallo no tiene que quedar guardado en el caché
  if (!res.ok) throw new Error(`No se pudo cargar el vendedor (${res.status})`)

  return (await res.json()) as PublicSeller
}