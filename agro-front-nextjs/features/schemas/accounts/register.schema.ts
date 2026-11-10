import z from "zod";

export const registerSchema = z.object({

    fullName: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre es demasiado largo"),

    email: z.string().trim().toLowerCase().email("Email inválido"),

    password: z
      .string()
      .min(8, "Mínimo 8 caracteres"),

    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),

    acceptTerms: z.boolean().refine((v) => v, {
        message: "Tenés que aceptar los términos y condiciones",
    }),
})

export type RegisterUseValues = z.infer<typeof registerSchema>;