import "server-only"
import { serverGet } from "@/lib/auth/server-get"
import { extractMessage, readJson } from "@/lib/http/response"
import type { SellerSummary } from "@/lib/types/seller-summary.type"

export type SellerSummaryResult =
    | { ok: true; summary: SellerSummary }
    | { ok: false; status: number; message: string }

export async function getSellerSummary(): Promise<SellerSummaryResult> {
    try {
        const res = await serverGet("/seller/summary")
        const body = await readJson<SellerSummary & { message?: string | string[] }>(res)

        if (!res.ok || !body) {
            return {
                ok: false,
                status: res.status,
                message:
                    res.status === 401 ? "Tu sesión venció. Ingresá de nuevo."
                        : (extractMessage(body) ?? `El servidor respondió ${res.status}`),
            }
        }

        return { ok: true, summary: body }
    } catch (error) {
        console.error("getSellerSummary:", error)
        return { ok: false, status: 0, message: "No se pudo conectar con el servidor" }
    }
}