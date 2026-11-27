"use client"

import { useAuth } from "@/features/providers/AuthProvider"
import { ResendVerificationButton } from "./ResendVerificationButton"

export function VerifyEmailBanner() {
    const { user } = useAuth()

    //- Solo si el backend dice explícitamente que NO está verificado: una sesión vieja sin el dato no muestra nada
    if (!user || user.emailVerified !== false) return null

    return (
        <div
            role="alert"
            className="flex flex-col gap-3 rounded-sm border border-amber-500/40 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
        >
            <p>
                <strong className="font-semibold">Verificá tu email.</strong> Te enviamos un enlace a{" "}
                <span className="font-medium">{user.email}</span>. Hasta que lo confirmes no podés enviar consultas ni
                registrarte como vendedor.
            </p>
            <ResendVerificationButton />
        </div>
    )
}