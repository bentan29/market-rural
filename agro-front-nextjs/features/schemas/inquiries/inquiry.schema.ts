import { z } from "zod"

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/

export const inquirySchema = z.object({
    name: z.string().trim().min(2, "Ingresá tu nombre").max(80, "Máximo 80 caracteres"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Ingresá tu email")
        .email("Ingresá un email válido")
        .max(120, "Máximo 120 caracteres"),
    phone: z
        .string()
        .trim()
        .refine((value) => value === "" || PHONE_REGEX.test(value), "Teléfono inválido"),
    message: z.string().trim().min(10, "Escribí al menos 10 caracteres").max(1000, "Máximo 1000 caracteres"),
    //- Campo trampa: está oculto, una persona no lo completa. Un bot sí
    company: z.string(),
})

export type InquiryValues = z.infer<typeof inquirySchema>