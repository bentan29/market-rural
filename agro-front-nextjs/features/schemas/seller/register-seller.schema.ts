import { LIST_COUNTRIES } from "@/features/constants/countries/countries"
import { z } from "zod"

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/

//- Opcional: vacío vale, pero si hay algo tiene que ser una URL http(s)
const optionalUrl = z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres")
    .refine((v) => {
        if (v === "") return true
        try {
            const url = new URL(v)
            return url.protocol === "http:" || url.protocol === "https:"
        } catch {
            return false
        }
    }, "Ingresá una URL válida (con https://)")

export const sellerSchema = z.object({
    displayName: z.string().trim().min(3, "Mínimo 3 caracteres").max(80, "Máximo 80 caracteres"),
    about: z.string().trim().max(2000, "Máximo 2000 caracteres"),
    
    phone: z.string().trim().refine(
            (v) => v === "" || PHONE_REGEX.test(v),
            "Teléfono inválido",
        ),

    whatsapp: z
        .string()
        .trim()
        .min(1, "El WhatsApp es obligatorio")
        .regex(PHONE_REGEX, "WhatsApp inválido"),

    website: optionalUrl,
    country: z
        .string()
        .refine((v) => LIST_COUNTRIES.some((c) => c.value === v), "Elegí un país"),
    location: z.string().trim().min(2, "Ingresá la ubicación").max(120, "Máximo 120 caracteres"),
})

export type SellerValues = z.infer<typeof sellerSchema>