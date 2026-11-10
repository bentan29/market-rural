import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().trim().min(1, "Ingresá tu email").email("Ingresá un email válido"),
    //- En login no se validan reglas de formato: el backend es quien decide
    password: z.string().min(1, "Ingresá tu contraseña"),
})

export type LoginValues = z.infer<typeof loginSchema>