import { SessionUser } from "./types/auth.type"

const API = '/api' // pasa por el rewrite de next.config.ts (mismo origen: sin cookies de terceros)


//- Rutas que no deben disparar refresh automático
const NO_REFRESH = [
    '/auth/login', 
    '/auth/register', 
    '/auth/refresh', 
    '/auth/logout'
]

let refreshing: Promise<boolean> | null = null

//? -- Refrescar tokens .. llama a /auth/refresh.
function callRefresh(): Promise<Response> {
    return fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' })
}


//? -- refreshSession: hace ese refresh una sola vez aunque 10 requests fallen a la vez (single-flight).
export function refreshSession(): Promise<boolean> {
    refreshing ??= (async () => {
        try {
            let res = await callRefresh()
            // console.log('[refreshSession] status:', res.status)
            // const body = await res.clone().json().catch(() => null)
            // console.log('[refreshSession] body:', body)

            //- Otra pestaña refrescó justo antes: la cookie nueva ya está, reintentamos una vez
            if (res.status === 401) {
                const body = await res.clone().json().catch(() => null)
                if (body?.code === 'REFRESH_RACE') {
                    await new Promise((r) => setTimeout(r, 300))
                    res = await callRefresh()
                }
            }
            return res.ok
        } catch {
            return false
        } finally {
            refreshing = null
        }
    })()
    return refreshing
}

// --- Lo usamos en componentes clientes
//? -- un fetch que, si recibe 401, refresca y reintenta la request original.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const run = () =>
        fetch(`${API}${path}`, {
            ...init, // ..init → conserva method, body, etc.
            credentials: 'include', //- con credentials: 'include' hacemos que el navegador adjunte la cookie solo
            headers: { 
                'Content-Type': 'application/json', 
                ...init.headers 
            },
    })

    let res = await run()

    //- Un 401 significa “access token vencido o inválido”.
    if (res.status === 401 && !NO_REFRESH.includes(path)) {
            if (await refreshSession()) {
            res = await run() // reintenta la request original con la cookie nueva
        } else if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }
  return res
}


//? -- Tomamos el Usuario actual para la UI. Si no hay sesión devuelve null y NO redirige
export async function fetchMe(): Promise<SessionUser | null> {
    try {

        let res = await fetch(`${API}/auth/me`, {
            credentials: "include",
            cache: "no-store",
        })

        if (res.status === 401) {
            const refreshed = await refreshSession()
            if (!refreshed) {
                return null
            }
            res = await fetch(`${API}/auth/me`, {
                credentials: "include",
                cache: "no-store",
            })
        }

        if (!res.ok) {
            console.error("Error al recuperar usuario:", res.status)
            return null
        }

        return (await res.json()) as SessionUser
    
    } catch (error) {
        console.error("Error de conexión al recuperar usuario:", error)
        return null
    }

}
