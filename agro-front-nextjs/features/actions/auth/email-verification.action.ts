"use server"

import { authFetch } from "@/lib/auth/server-fetch"
import { extractMessage, readJson } from "@/lib/http/response"

const API = process.env.API_URL

export type VerifyEmailResult = { ok: true; next: string | null } | { ok: false; message: string }

//- Pública: quien abre el enlace puede no tener sesión (otro dispositivo, otro navegador)
export async function verifyEmailAction(token: string): Promise<VerifyEmailResult> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { ok: false, message: "El enlace no es válido." }
    if (!API) return { ok: false, message: "Falta API_URL en las variables de entorno" }

    try {
        const res = await fetch(`${API}/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            cache: "no-store",
        })
        const body = await readJson<{ next?: string | null; message?: string | string[] }>(res)

        if (!res.ok) return { ok: false, message: extractMessage(body) ?? "No pudimos verificar tu email." }

        return { ok: true, next: body?.next ?? null }
    } catch {
        return { ok: false, message: "No pudimos conectar con el servidor. Probá de nuevo." }
    }
}

export type ResendResult =
    | { ok: true; alreadyVerified: boolean }
    | { ok: false; status?: number; message: string; retryAfter?: number }

export async function resendVerificationAction(next?: string): Promise<ResendResult> {
    //- Solo se manda si es una ruta interna (el backend la vuelve a validar)
    const query = next && /^\/(?!\/)/.test(next) ? `?next=${encodeURIComponent(next)}` : ""

    try {
        const res = await authFetch(`/auth/resend-verification${query}`, { method: "POST" })
        const body = await readJson<{ alreadyVerified?: boolean; retryAfter?: number; message?: string | string[] }>(res)

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                retryAfter: body?.retryAfter,
                message:
                    res.status === 401 ? "Tu sesión venció. Ingresá de nuevo."
                        : (extractMessage(body) ?? "No pudimos enviar el correo. Probá de nuevo."),
            }
        }

        return { ok: true, alreadyVerified: !!body?.alreadyVerified }
    } catch {
        return { ok: false, message: "No pudimos conectar con el servidor. Probá de nuevo." }
    }
}