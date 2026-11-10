import 'server-only'

import { serverGet } from '@/lib/auth/server-get'
import type { PreviousSeller } from '@/lib/types/seller.type'
import { readJson } from '@/lib/http/response'

//- Si falla (o no hay perfil previo) devolvemos null: el formulario se muestra vacío, como la primera vez
export async function getPreviousSeller(): Promise<PreviousSeller | null> {
    try {
        const res = await serverGet('/seller/previous')
        if (!res.ok) return null

        const body = await readJson<{ previous: PreviousSeller | null }>(res)
        return body?.previous ?? null
    } catch {
        return null
    }
}