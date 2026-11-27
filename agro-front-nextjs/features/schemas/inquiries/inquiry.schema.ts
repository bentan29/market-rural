import { z } from "zod"

//- Entre 7 y 15 dígitos en total, con "+", espacios y guiones permitidos
export const PHONE_REGEX = /^(?=(?:\D*\d){7,15}\D*$)\+?[0-9\s-]{7,20}$/

//- Nombre y email ya no se piden: salen de la cuenta
export const inquirySchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Ingresá tu teléfono")
    .regex(PHONE_REGEX, "Ingresá un teléfono válido, con código de país si es posible"),
  message: z.string().trim().min(10, "Escribí al menos 10 caracteres").max(1000, "Máximo 1000 caracteres"),
  //- Campo trampa: está oculto, una persona no lo completa. Un bot sí
  company: z.string(),
})

export type InquiryValues = z.infer<typeof inquirySchema>