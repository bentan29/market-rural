"use server"

import { inquirySchema, type InquiryValues } from "@/features/schemas/inquiries/inquiry.schema"
import { authFetch } from "@/lib/auth/server-fetch"
import { extractMessage, readJson } from "@/lib/http/response"

export type InquiryResult = { ok: true } | { ok: false; status?: number; message: string }

export async function sendInquiryAction(slug: string, values: InquiryValues): Promise<InquiryResult> {

    //- Un Server Action es un endpoint público: se valida de nuevo en el servidor
    const parsed = inquirySchema.safeParse(values)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
    }

    if (!/^[a-z0-9-]{1,120}$/.test(slug)) return { ok: false, message: "Publicación inválida" }

    //- Campo trampa completo: se responde "bien" sin hacer nada, para que el bot no sepa que lo detectamos
    if (parsed.data.company) return { ok: true }

    const { phone, message } = parsed.data

    try {
        const res = await authFetch(`/inquiry/${encodeURIComponent(slug)}/listing`, {
            method: "POST",
            body: JSON.stringify({ phone, message }),
        })
        const body = await readJson<{ message?: string | string[] }>(res)

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                message:
                    res.status === 401 ? "Tu sesión venció. Ingresá de nuevo."
                        : res.status === 404 ? "Esta publicación ya no está disponible."
                            : (extractMessage(body) ?? "No pudimos enviar tu consulta. Probá de nuevo."),
            }
        }

        return { ok: true }
    } catch (error) {
        console.error("sendInquiryAction:", error)
        return { ok: false, message: "No pudimos conectar con el servidor. Probá de nuevo." }
    }
}