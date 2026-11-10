'use server'

import { sellerSchema, SellerValues } from '@/features/schemas/seller/register-seller.schema';
import { authFetch } from '@/lib/auth/server-fetch';

import type { SessionUser } from '@/lib/types/auth.type'
import { updateTag } from 'next/cache';

type RegisterSellerResult =
  | { ok: true; user: SessionUser | null }
  | { ok: false; status?: number; message: string }

//- Solo se envían los opcionales que tienen valor
function toPayload(values: SellerValues) {
  return {
    displayName: values.displayName,
    phone: values.phone,
    country: values.country,
    location: values.location,
    ...(values.about && { about: values.about }),
    ...(values.whatsapp && { whatsapp: values.whatsapp }),
    ...(values.website && { website: values.website }),
  }
}

export async function registerSellerAction(values: SellerValues): Promise<RegisterSellerResult> {

    if (!process.env.API_URL) return { 
        ok: false,
        message: 'Falta API_URL en las variables de entorno' 
    }

    //- Un Server Action es un endpoint público: se valida de nuevo en el servidor
    const parsed = sellerSchema.safeParse(values)
    if (!parsed.success) {
        return { 
            ok: false, 
            status: 400, 
            message: parsed.error.issues[0]?.message ?? 'Datos inválidos' 
        }
    }

    try {
        const res = await authFetch('/seller/register', {
            method: 'POST',
            body: JSON.stringify(toPayload(parsed.data)),
        })

        //- El body se lee una sola vez, y solo si es JSON
        const isJson = res.headers.get('content-type')?.includes('application/json')
        const body = isJson ? await res.json().catch(() => null) : null

        if (!res.ok) {
            const message = Array.isArray(body?.message) ? body.message[0] : body?.message
            return {
                ok: false,
                status: res.status,
                message:
                res.status === 401
                    ? 'Tu sesión venció. Ingresá de nuevo.'
                    : (message ?? `El servidor respondió ${res.status}`),
            }
        }

        //- El rol ya cambió a SELLER: devolvemos el usuario actualizado para el contexto del cliente
        let user: SessionUser | null = null
        const me = await authFetch('/auth/me')
        if (me.ok) user = (await me.json()) as SessionUser

        updateTag('listings')
        
        return { 
            ok: true, 
            user 
        }
        
    } catch (error) {
        console.error('registerSellerAction:', error)
        return { ok: false, message: 'No se pudo conectar con el servidor' }
    }
}