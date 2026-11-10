import 'server-only' 

import { cookies } from 'next/headers'
import { parse as parseSetCookie } from 'set-cookie-parser'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/types/auth.type'

const API = process.env.API_URL

//? -- Reenvía al navegador las cookies que dejó Nest, tal cual.
//? -- Solo funciona dentro de un Server Action o Route Handler (en un Server Component no se pueden escribir cookies)
export async function forwardSetCookies(setCookies: string[]) {
    const store = await cookies()
    for (const c of parseSetCookie(setCookies)) {
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
}

//? -- Devuelve el access token nuevo, o null si el refresh no es válido
async function refreshTokens(refreshToken: string): Promise<string | null> {
    try {
        const res = await fetch(`${API}/auth/refresh`, {
            method: 'POST',
            headers: { Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` },
            cache: 'no-store',
        })
        if (!res.ok) return null

        const setCookies = res.headers.getSetCookie()
        await forwardSetCookies(setCookies)

        return parseSetCookie(setCookies).find((c) => c.name === ACCESS_COOKIE_NAME)?.value ?? null
    } catch {
        return null
    }
}

//? -- fetch autenticado para Server Actions: manda el access token y, si venció, refresca una vez y reintenta
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
    
    const store = await cookies()
    const access = store.get(ACCESS_COOKIE_NAME)?.value
    const refreshToken = store.get(REFRESH_COOKIE_NAME)?.value

    const run = (token: string) =>
        fetch(`${API}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init.headers,
                Cookie: `${ACCESS_COOKIE_NAME}=${token}`,
            },
            cache: 'no-store',
        })

    if (access) {
        const res = await run(access)
        if (res.status !== 401) return res
    }

    if (!refreshToken) return new Response(null, { status: 401 })

    const newAccess = await refreshTokens(refreshToken)
    if (!newAccess) return new Response(null, { status: 401 })

    return run(newAccess)
}