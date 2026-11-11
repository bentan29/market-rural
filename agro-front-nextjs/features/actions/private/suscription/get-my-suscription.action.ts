import 'server-only'

import { serverGet } from '@/lib/auth/server-get'
import type { SuscriptionType } from '@/lib/types/suscription.type'
import { unstable_rethrow } from 'next/navigation';

export type MySuscriptionResult =
  | { ok: true; suscription: SuscriptionType }
  | { ok: false; status: number; message: string }

//- El body se lee una sola vez, y solo si es JSON
async function readErrorMessage(res: Response): Promise<string> {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json().catch(() => null) : null
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message

  if (res.status === 401) return 'Tu sesión venció. Ingresá de nuevo.'
  if (res.status === 403) return 'No sos un vendedor.'
  return message ?? `El servidor respondió ${res.status}`
}

export async function getMySuscriptionAction(): Promise<MySuscriptionResult> {
  if (!process.env.API_URL) {
    return { ok: false, status: 500, message: 'Falta API_URL en las variables de entorno' }
  }

  try {
    const res = await serverGet('/subscription/mySuscription')

    if (!res.ok) {
      return { 
        ok: false, 
        status: res.status, 
        message: await readErrorMessage(res) 
      }
    }

    return { 
      ok: true, 
      suscription: (await res.json()) as SuscriptionType 
    }

   } catch (error) {
    //- Relanza errores internos de Next (prerender, redirect, notFound).
    //- Tiene que ser lo primero del catch.
    unstable_rethrow(error)

    console.error('getMySuscriptionAction:', error)
    return { ok: false, status: 0, message: 'No se pudo conectar con el servidor' }
  }
}