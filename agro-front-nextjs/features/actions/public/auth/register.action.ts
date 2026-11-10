'use server'

import { RegisterUseValues } from "@/features/schemas/accounts/register.schema";

export async function registerUserAction(values: RegisterUseValues) {

    const { confirmPassword, ...payload } = values 

    try {

        const res = await fetch(`${process.env.API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const error = await res.json()
            return { 
                ok: false, 
                message: error.message ?? "Error al crear la cuenta"
            }
        }

        return { ok: true }

    } catch(error) {
        console.log('🔴 catch error:', error)  
        return {
            ok: false,
            message: "No se pudo conectar con el servidor"
        }
    }

}