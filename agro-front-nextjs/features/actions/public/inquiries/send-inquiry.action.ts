"use server"

import { inquirySchema, type InquiryValues } from "@/features/schemas/inquiries/inquiry.schema"
import { extractMessage, readJson } from "@/lib/http/response"

const API = process.env.API_URL

export type InquiryResult = { ok: true } | { ok: false; message: string }

export async function sendInquiryAction(slug: string, values: InquiryValues): Promise<InquiryResult> {

    //- Un Server Action es un endpoint público: se valida de nuevo en el servidor
    const parsed = inquirySchema.safeParse(values)
    if (!parsed.success) {
        return {
            ok: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos"
        }
    }

    if (!/^[a-z0-9-]{1,120}$/.test(slug)) return {
        ok: false,
        message: "Publicación inválida"
    }

    if (!API) return {
        ok: false,
        message: "Falta API_URL en las variables de entorno"
    }

    //- Campo trampa completo: se responde "bien" sin hacer nada, para que el bot no sepa que lo detectamos
    if (parsed.data.company) return { ok: true }

    const { company, phone, ...rest } = parsed.data

    try {
        const res = await fetch(`${API}/listing/${encodeURIComponent(slug)}/inquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...rest, ...(phone && { phone }) }),
            cache: "no-store",
        })
        const body = await readJson<{ message?: string | string[] }>(res)

        if (!res.ok) {
            return {
                ok: false,
                message:
                    res.status === 404 ? "Esta publicación ya no está disponible."
                        : (extractMessage(body) ?? "No pudimos enviar tu mensaje. Probá de nuevo."),
            }
        }

        return { ok: true }
    } catch {
        return { ok: false, message: "No pudimos conectar con el servidor. Probá de nuevo." }
    }
}