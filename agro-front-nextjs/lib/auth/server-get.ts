import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_COOKIE_NAME } from '@/lib/types/auth.type'

const API = process.env.API_URL

//- GET autenticado para Server Components.
//- No refresca: proxy.ts ya renovó la sesión antes de renderizar (y acá no se pueden escribir cookies)
export async function serverGet(path: string): Promise<Response> {
    
    const store = await cookies()
    const access = store.get(ACCESS_COOKIE_NAME)?.value
    if (!access) return new Response(null, { status: 401 })

    return fetch(`${API}${path}`, {
        headers: { Cookie: `${ACCESS_COOKIE_NAME}=${access}` },
        cache: 'no-store',
    })

}