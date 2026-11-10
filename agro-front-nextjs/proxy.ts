/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  proxy.ts: el "portero" de la app                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Se ejecuta ANTES de renderizar cada página (en Next 15 o anterior este
 * archivo se llama middleware.ts). Resuelve cuatro cosas:
 *
 *   1. RENOVAR la sesión en silencio cuando el access token venció.
 *   2. PROTEGER las rutas privadas (si no hay sesión, al login).
 *   3. EVITAR que alguien ya logueado vea el login o el registro.
 *   4. FILTRAR el panel de admin por rol.
 *
 * ── Las dos cookies ─────────────────────────────────────────────────────
 *   accessToken    JWT de vida corta (15 min). Es el que dice "quién sos".
 *   refresh_token  Token de vida larga (7 días). Solo sirve para pedirle a
 *                  Nest un accessToken nuevo (y rotarse a sí mismo).
 *
 * ── El flujo en cada request ────────────────────────────────────────────
 *   ¿access vigente?  ──sí──▶ seguimos normal
 *          │ no
 *          ▼
 *   ¿hay refresh_token? ──no──▶ anónimo
 *          │ sí
 *          ▼
 *   pedimos tokens nuevos a Nest (POST /auth/refresh)
 *          ├─ ok       ▶ reenviamos las cookies nuevas y seguimos logueado
 *          ├─ invalid  ▶ el refresh ya no sirve: lo borramos, anónimo
 *          └─ race/err ▶ no sabemos: NO tocamos nada ("sesión pendiente")
 *
 * ── Los tres estados que calcula ────────────────────────────────────────
 *   hasSession      Sesión CONFIRMADA (access vigente en mano).
 *   sessionPending  Probable pero no confirmada (carrera, prefetch, Nest
 *                   caído). Se trata como logueado para NO desloguear a
 *                   nadie por un problema temporal.
 *   anónimo         Ninguna de las dos.
 *
 * ⚠️  Esto es solo navegación (qué pantalla mostrar). La seguridad real de
 *     los datos la hace Nest con sus guards en cada endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
} from './lib/types/auth.type'

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE RUTAS
// ─────────────────────────────────────────────────────────────────────────

// Rutas que exigen sesión. Si entrás sin estar logueado, te manda al login.
const PROTECTED_ROUTES = [
    '/dashboard',
    '/mensajes',
    '/publicaciones',
    '/cuenta',
    '/favoritos',
]

// Rutas "solo para anónimos". Si ya tenés sesión no tiene sentido mostrarlas.
const AUTH_ROUTES = ['/login', '/registrarme']

// Panel de administración: exige sesión Y rol ADMIN.
const ADMIN_ROUTES = ['/admin']

// ¿La ruta actual pertenece a alguna de la lista?
// Compara por segmento completo: '/dashboard' matchea '/dashboard/x'
// pero NO '/dashboardfoo' (por eso el `${route}/`).
const matches = (pathname: string, routes: string[]) =>
    routes.some(
        (route) =>
            pathname === route || pathname.startsWith(`${route}/`),
    )

// ─────────────────────────────────────────────────────────────────────────
// LECTURA DEL JWT (solo para decidir navegación, NO valida la firma)
// ─────────────────────────────────────────────────────────────────────────

type JwtPayload = {
    role?: string
    exp?: number // vencimiento, en segundos desde 1970
}

// Un JWT son 3 partes separadas por puntos: header.payload.firma.
// Acá solo leemos la del medio (el payload), que es JSON en base64.
// OJO: no verificamos la firma, así que un token falsificado pasaría. Está
// bien porque solo usamos esto para elegir una pantalla; Nest es quien
// valida de verdad cada request.
function decodePayload(token: string): JwtPayload | null {
    try {
        const payload = token.split('.')[1]
        if (!payload) return null

        return JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf-8'),
        ) as JwtPayload
    } catch {
        return null
    }
}

// ¿El access token ya venció (o está por vencer)?
// Si no se puede leer o no trae `exp`, lo tratamos como vencido por seguridad.
function isAccessTokenExpired(token: string): boolean {
    const payload = decodePayload(token)

    if (!payload || typeof payload.exp !== 'number') {
        return true
    }

    // `exp` está en segundos y Date.now() en milisegundos, de ahí el * 1000.
    // El margen de 5 s evita usar un token que vence mientras la request viaja.
    return payload.exp * 1000 <= Date.now() + 5000
}

// ─────────────────────────────────────────────────────────────────────────
// RENOVACIÓN DE SESIÓN (llamada a Nest)
// ─────────────────────────────────────────────────────────────────────────

// Los cuatro desenlaces posibles de un refresh. Distinguirlos es clave para
// no desloguear a alguien por error:
type RefreshResult =
    | { status: 'ok'; setCookies: string[] } // Nest devolvió tokens nuevos
    | { status: 'race' }    // otra request refrescó justo antes (es normal)
    | { status: 'invalid' } // el refresh venció, fue revocado o reutilizado
    | { status: 'error' }   // Nest caído, API_URL mal configurada, etc.

async function refreshSession( refreshToken: string ): Promise<RefreshResult> {
    try {
        const apiUrl = process.env.API_URL

        if (!apiUrl) {
            console.error('[proxy] Falta configurar API_URL')
            return { status: 'error' }
        }

        // Llamamos a Nest DIRECTO (no por el rewrite de /api del navegador),
        // mandando a mano la cookie del refresh porque esto corre en el
        // servidor de Next y no en el navegador.
        const res = await fetch(
            `${apiUrl.replace(/\/$/, '')}/auth/refresh`,
            {
                method: 'POST',
                headers: {
                    Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}`,
                },
                cache: 'no-store', // nunca cachear: cada refresh es único
            },
        )

        // ── Caso feliz ──
        if (res.ok) {
            // Nest respondió con headers `Set-Cookie` (accessToken nuevo y
            // refresh_token rotado). Los guardamos para reenviarlos al navegador.
            const setCookies = res.headers.getSetCookie()

            const cookieNames = setCookies.map((cookie) =>
                cookie.split(';', 1)[0].split('=', 1)[0].trim(),
            )

            //- Verificación de seguridad: tienen que venir LAS DOS cookies.
            //  Si falta alguna, guardar solo una dejaría la sesión a medias
            //  (por ejemplo, un refresh rotado sin que el navegador lo reciba).
            if (
                !cookieNames.includes(ACCESS_COOKIE_NAME) ||
                !cookieNames.includes(REFRESH_COOKIE_NAME)
            ) {
                console.error(
                    '[proxy] La respuesta no contiene ambas cookies renovadas',
                )
                return { status: 'error' }
            }

            return { status: 'ok', setCookies }
        }

        // ── 401: ¿carrera o refresh inválido? ──
        if (res.status === 401) {
            
            const body: { code?: string } | null = await res.json().catch(() => null)

            // Nest marca con este código el caso "otra pestaña/request acaba de
            // rotar el token". La ganadora ya dejó las cookies nuevas, así que
            // acá NO hay que borrar nada.
            if (body?.code === 'REFRESH_RACE') {
                return { status: 'race' }
            }

            // Cualquier otro 401: el refresh ya no sirve de verdad.
            return { status: 'invalid' }
        }

        // Cualquier otro status (500, 502...): problema del servidor, no de la sesión.
        console.error('[proxy] Error al renovar:', res.status)
        return { status: 'error' }
    } catch (error) {
        // Falló la conexión misma (Nest apagado, red caída).
        console.error('[proxy] Error de conexión al renovar:', error)
        return { status: 'error' }
    }
}

// Convierte una línea Set-Cookie en [nombre, valor]:
//   "accessToken=abc123; Path=/; HttpOnly"  ->  ["accessToken", "abc123"]
// Devuelve null si la línea no tiene forma de cookie.
function parsePair( setCookie: string ): [string, string] | null {
    const pair = setCookie.split(';', 1)[0] // nos quedamos con "nombre=valor"
    const separator = pair.indexOf('=')

    if (separator < 1) return null

    return [
        pair.slice(0, separator).trim(),
        pair.slice(separator + 1), // todo lo que sigue al primer "=" (el valor puede tener más "=")
    ]
}

// ─────────────────────────────────────────────────────────────────────────
// EL PROXY (corre en cada navegación)
// ─────────────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {

    const { pathname, search } = req.nextUrl

    // Next precarga en segundo plano los links visibles (prefetch). Esas
    // requests NO deben refrescar tokens: serían varias a la vez y se pisarían
    // entre sí (carreras innecesarias) por páginas que quizás nadie visita.
    const isPrefetch =
        req.headers.has('next-router-prefetch') ||
        req.headers.get('purpose') === 'prefetch'

    // ── PASO 1: leer las cookies que mandó el navegador ──
    // `let` en accessToken porque puede reemplazarse por uno nuevo si refrescamos.
    let accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value

    // Acá se acumulan los efectos que hay que aplicar a la respuesta final:
    let setCookies: string[] = []   // cookies nuevas que dejó Nest (se reenvían tal cual)
    let clearRefresh = false        // true => borrar el refresh_token del navegador
    let sessionPending = false      // true => hay sesión probable pero sin confirmar

    // ── PASO 2: renovar la sesión si hace falta ──
    // Hace falta cuando no hay access token (el navegador borró la cookie al
    // vencer su maxAge) o cuando el JWT que hay ya está vencido.
    const needsRefresh = !accessToken || isAccessTokenExpired(accessToken)

    // Solo tiene sentido renovar si hay un refresh_token para usar.
    if (needsRefresh && refreshToken) {
        if (isPrefetch) {
            // Prefetch: no renovamos, pero tampoco desconocemos la sesión.
            sessionPending = true
        } else {
            const result = await refreshSession(refreshToken)

            if (result.status === 'ok') {
                // Guardamos las cookies nuevas para reenviarlas más abajo.
                setCookies = result.setCookies

                // Sacamos el access nuevo de ahí para usarlo YA en esta request
                // (la página que se va a renderizar necesita verlo).
                const newAccessCookie = setCookies
                    .map(parsePair)
                    .find(
                        (pair) => pair?.[0] === ACCESS_COOKIE_NAME,
                    )

                accessToken = newAccessCookie?.[1]

                if (!accessToken) {
                    sessionPending = true
                }
            } else if (result.status === 'invalid') {
                // Nest dijo que el refresh no sirve más: sesión terminada.
                // Es el ÚNICO caso en que se borra el refresh_token.
                clearRefresh = true
                accessToken = undefined
            } else {
                // Ante una carrera o un error temporal,
                // no eliminamos las cookies existentes.
                sessionPending = true
            }
        }
    }

    // ── PASO 3: resumir el estado de la sesión ──
    // hasSession: tenemos un access token vigente (confirmado).
    const hasSession =
        !!accessToken && !isAccessTokenExpired(accessToken)

    // isLoggedIn: confirmada O probable. Se usa para PROTEGER rutas, donde es
    // preferible no sacar a nadie por un fallo pasajero. (Para redirigir fuera
    // del login usamos hasSession, más abajo, para evitar bucles.)
    const isLoggedIn = hasSession || sessionPending

    // ── Helpers de respuesta ──

    // TODAS las respuestas pasan por acá para aplicar lo acumulado arriba.
    const finalize = (response: NextResponse) => {
        // Reenviamos al navegador las cookies de Nest SIN reescribirlas (así
        // conservan exactamente su path, maxAge, httpOnly, etc., y no se
        // duplican cookies con el mismo nombre).
        for (const cookie of setCookies) {
            response.headers.append('set-cookie', cookie)
        }

        if (clearRefresh) {
            response.cookies.delete(REFRESH_COOKIE_NAME)
        }

        return response
    }

    const redirectTo = (path: string) =>
        finalize(
            NextResponse.redirect(new URL(path, req.url)),
        )

    // Redirige al login recordando a dónde iba (?next=...), para que después
    // de ingresar el usuario vuelva a esa página.
    const redirectToLogin = () => {
        const url = new URL('/login', req.url)
        url.searchParams.set('next', `${pathname}${search}`)

        return finalize(NextResponse.redirect(url))
    }

    // ── PASO 4: reglas de acceso ──

    // Admin: requiere sesión y rol ADMIN.
    // El rol se decodifica aquí solo para decidir la navegación;
    // la autorización real debe validarse en NestJS.
    if (matches(pathname, ADMIN_ROUTES)) {
        if (!isLoggedIn) {
            return redirectToLogin()
        }

        // Solo miramos el rol con sesión CONFIRMADA: con una "pendiente" no
        // tenemos token fiable del cual leerlo.
        if (
            hasSession &&
            decodePayload(accessToken!)?.role !== 'ADMIN'
        ) {
            return redirectTo('/')
        }
    }

    // Login/registro con sesión: al dashboard. Usamos hasSession (confirmada) y
    // no isLoggedIn: si Nest está caído y la sesión solo es "probable", mandar
    // al dashboard provocaría un bucle (dashboard -> login -> dashboard...).
    if (matches(pathname, AUTH_ROUTES) && hasSession) {
        return redirectTo('/dashboard')
    }

    // Ruta privada sin sesión (ni confirmada ni pendiente): al login.
    if (
        matches(pathname, PROTECTED_ROUTES) &&
        !isLoggedIn
    ) {
        return redirectToLogin()
    }

    // ── PASO 5: dejar pasar la request ──

    // Si renovamos la sesión, hay que propagar las cookies nuevas en DOS
    // direcciones: al navegador (lo hace finalize) y a la página que Next está
    // por renderizar. Esta segunda parte es la que se suele olvidar: la request
    // original todavía trae el access token VIEJO, así que sin esto la página
    // vería al usuario como no logueado.
    if (setCookies.length > 0) {
        // Partimos de las cookies que mandó el navegador...
        const merged = new Map<string, string>(
            req.cookies
                .getAll()
                .map(({ name, value }) => [name, value]),
        )

        // ...y pisamos las que acaba de renovar Nest.
        for (const cookie of setCookies) {
            const pair = parsePair(cookie)
            if (pair) merged.set(pair[0], pair[1])
        }

        // Reescribimos el header `cookie` de la request que continúa.
        const headers = new Headers(req.headers)

        headers.set(
            'cookie',
            [...merged]
                .map(([name, value]) => `${name}=${value}`)
                .join('; '),
        )

        return finalize(
            NextResponse.next({
                request: { headers },
            }),
        )
    }

    // Sin renovación: seguimos tal cual.
    return finalize(NextResponse.next())
}

// Dónde corre el proxy. Se excluye (el `?!` es "todo MENOS"):
//   api            las llamadas del navegador a /api las maneja apiFetch; si el
//                  proxy las refrescara primero, el refresh del navegador
//                  llegaría con un token ya rotado y parecería un robo.
//   _next/static   archivos del build (JS, CSS).
//   _next/image    imágenes optimizadas por Next.
//   favicon.ico    el ícono del sitio.
//   .*\..*         cualquier archivo con extensión (.png, .css, .js...).
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}