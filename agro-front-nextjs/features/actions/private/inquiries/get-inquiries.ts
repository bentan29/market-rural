import "server-only"
import { serverGet } from "@/lib/auth/server-get"
import { extractMessage, readJson } from "@/lib/http/response"
import type { ReceivedPage, SentPage } from "@/lib/types/inquiry.type"

export type InquiriesResult<T> =
    | { ok: true; data: T }
    | { ok: false; status: number; message: string }

//- Lecturas de datos (no son Server Actions): sin "use server"
async function fetchPage<T>(path: string, page: number, limit: number): Promise<InquiriesResult<T>> {
    try {
        const res = await serverGet(`${path}?page=${page}&limit=${limit}`)
        const body = await readJson<T & { message?: string | string[] }>(res)

        if (!res.ok || !body) {
            return {
                ok: false,
                status: res.status,
                message:
                    res.status === 401 ? "Tu sesión venció. Ingresá de nuevo."
                        : res.status === 403 ? "No tenés permiso para ver esto."
                            : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
            }
        }

        return { ok: true, data: body }
    } catch (error) {
        console.error(`getInquiries ${path}:`, error)
        return { ok: false, status: 0, message: "No se pudo conectar con el servidor" }
    }
}

export const getSentInquiries = (page = 1, limit = 8) => fetchPage<SentPage>("/inquiry/sent", page, limit)
export const getReceivedInquiries = (page = 1, limit = 8) => fetchPage<ReceivedPage>("/inquiry/received", page, limit)