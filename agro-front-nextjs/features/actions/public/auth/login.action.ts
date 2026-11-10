'use server'

import { cookies, headers } from 'next/headers'
import { parse as parseSetCookie } from 'set-cookie-parser'
import type { LoginValues } from '@/features/schemas/accounts/login.schema'
import type { SessionUser } from '@/lib/types/auth.type'

const API = process.env.API_URL

type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; status?: number; message: string }

export async function loginUserAction(values: LoginValues): Promise<LoginResult> {
  if (!API) return { ok: false, message: 'Falta API_URL en las variables de entorno' }

  const h = await headers()

  //- En Vercel la IP real viene en x-real-ip; en local no viene (queda vacía)
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0].trim() ?? ''
  const userAgent = h.get('user-agent') ?? ''
  const secret = process.env.INTERNAL_API_SECRET

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userAgent && { 'User-Agent': userAgent }),
        //- La IP solo se manda junto al secreto: Nest la acepta únicamente si el secreto coincide
        ...(ip && secret && { 'X-Client-Ip': ip, 'X-Internal-Secret': secret }),
      },
      body: JSON.stringify({ email: values.email, password: values.password }),
      cache: 'no-store',
    })

    //- El body se lee una sola vez, y solo si es JSON
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const body = isJson ? await res.json().catch(() => null) : null

    if (!res.ok) {
      const message = Array.isArray(body?.message) ? body.message[0] : body?.message
      return {
        ok: false,
        status: res.status,
        message: message ?? (res.status === 401 ? 'Credenciales inválidas' : `El servidor respondió ${res.status}`),
      }
    }

    //- Como el fetch lo hizo el servidor de Next, el navegador nunca vio los Set-Cookie de Nest:
    //- los reenviamos tal cual (accessToken + refresh_token)
    const store = await cookies()
    for (const c of parseSetCookie(res.headers.getSetCookie())) {
      store.set({
        name: c.name,
        value: c.value,
        path: c.path,
        domain: c.domain,
        maxAge: c.maxAge,
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined,
      })
    }

    return { ok: true, user: body.user as SessionUser }
  } catch (error) {
    console.error('loginUserAction:', error)
    return { ok: false, message: 'No se pudo conectar con el servidor' }
  }
}