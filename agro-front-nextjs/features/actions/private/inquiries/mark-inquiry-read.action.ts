"use server"

import { authFetch } from "@/lib/auth/server-fetch"
import { extractMessage, readJson } from "@/lib/http/response"

export type MarkReadResult = { ok: true } | { ok: false; status?: number; message: string }

export async function markInquiryReadAction(id: string): Promise<MarkReadResult> {
    try {
        const res = await authFetch(`/inquiry/${encodeURIComponent(id)}/read`, { method: "PATCH" })
        const body = await readJson<{ message?: string | string[] }>(res)

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                message:
                    res.status === 401 ? "Tu sesión venció. Ingresá de nuevo."
                        : (extractMessage(body) ?? "No pudimos marcar la consulta como leída."),
            }
        }

        return { ok: true }
    } catch {
        return { ok: false, message: "No se pudo conectar con el servidor" }
    }
}