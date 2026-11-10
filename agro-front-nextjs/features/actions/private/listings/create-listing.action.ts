"use server"

import { updateTag } from "next/cache"
import { authFetch } from "@/lib/auth/server-fetch"
import { extractMessage, readJson } from "@/lib/http/response"
import type { CreateListingPayload } from "@/features/schemas/listings/listing.schema"

export type CreateListingResult =
  | { ok: true; slug: string }
  | { ok: false; status?: number; message: string }

//- Quita lo que no se completó: un "" en un número se convertiría en 0 y fallaría la validación del backend
function toPayload(values: CreateListingPayload) {
  return Object.fromEntries(
    Object.entries(values).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  )
}

export async function createListing(values: CreateListingPayload): Promise<CreateListingResult> {
  try {
    const res = await authFetch("/listings", {
      method: "POST",
      body: JSON.stringify(toPayload(values)),
    })

    const body = await readJson<{ slug?: string; message?: string | string[] }>(res)

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message:
          res.status === 401
            ? "Tu sesión venció. Ingresá de nuevo."
            : (extractMessage(body) ?? "No pudimos crear la publicación."),
      }
    }

    //- El catálogo cacheado tiene que mostrar la publicación nueva
    updateTag("listings")

    return { ok: true, slug: body?.slug ?? "" }
  } catch {
    return {
      ok: false,
      message: "No pudimos conectar con el servidor. Probá de nuevo.",
    }
  }
}