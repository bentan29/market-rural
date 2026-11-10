import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ACCESS_COOKIE_NAME, SessionUser } from '../types/auth.type'

//- Directo a Nest (no pasa por el rewrite de /api, que es solo para el navegador)
const API = process.env.API_URL

//- cache(): si varios componentes lo llaman en la misma request, se consulta una sola vez.
//- No refresca: de eso se encarga proxy.ts antes de que la página se renderice.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
    if (!API) {
        console.error('Falta API_URL en las variables de entorno')
        return null
    }

    const store = await cookies()
    const access = store.get(ACCESS_COOKIE_NAME)?.value
    if (!access) return null

    try {
        const res = await fetch(`${API}/auth/me`, {
            headers: { Cookie: `${ACCESS_COOKIE_NAME}=${access}` },
            cache: 'no-store',
        })
        if (!res.ok) return null
        return (await res.json()) as SessionUser
    } catch {
        return null // backend caído: se trata como sin sesión
    }
})

//- Para páginas privadas: si no hay usuario, al login
export async function requireUser(): Promise<SessionUser> {
    const user = await getCurrentUser()
    if (!user) redirect('/login')
    return user
}

//- Para páginas por rol (ej. solo vendedores). El rol real lo vuelve a validar Nest en cada endpoint
export async function requireRole(...roles: SessionUser['role'][]): Promise<SessionUser> {
    const user = await requireUser()
    if (!roles.includes(user.role)) redirect('/')
    return user
}