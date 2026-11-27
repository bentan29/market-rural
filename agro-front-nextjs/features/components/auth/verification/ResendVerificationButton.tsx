"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "@/components/ui/toast"
import { resendVerificationAction } from "@/features/actions/auth/email-verification.action"
import { useAuth } from "@/features/providers/AuthProvider"
import { fetchMe } from "@/lib/api"
import { cn } from "@/lib/utils"

const COOLDOWN_SECONDS = 60

type Props = {
    /** Adónde volver después de verificar. Por defecto, la página donde está el botón */
    next?: string
    className?: string
}

export function ResendVerificationButton({ next, className }: Props) {
    const { setUser } = useAuth()
    const [isPending, startTransition] = useTransition()
    const [secondsLeft, setSecondsLeft] = useState(0)

    //- Cuenta regresiva: el backend también la exige, esto solo evita clics que van a rebotar
    useEffect(() => {
        if (secondsLeft <= 0) return
        const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
        return () => clearTimeout(id)
    }, [secondsLeft])

    function onClick() {
        startTransition(async () => {
            try {
                //- Se lee al hacer clic (no al renderizar): así no hace falta usePathname ni un Suspense
                const target = next ?? window.location.pathname + window.location.search
                const res = await resendVerificationAction(target)

                if (!res.ok) {
                    if (res.retryAfter) setSecondsLeft(res.retryAfter)
                    toast.add({ type: "error", description: res.message })
                    return
                }

                //- Ya lo había verificado (por ejemplo, desde otro dispositivo): se actualiza la sesión
                if (res.alreadyVerified) {
                    setUser(await fetchMe())
                    toast.add({ type: "success", description: "Tu email ya está verificado." })
                    return
                }

                setSecondsLeft(COOLDOWN_SECONDS)
                toast.add({
                    type: "success",
                    description: "Te enviamos un nuevo enlace. Revisá también el correo no deseado.",
                })
            } catch {
                toast.add({ type: "error", description: "Ocurrió un error inesperado" })
            }
        })
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isPending || secondsLeft > 0}
            className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center rounded-sm border border-amber-600/40 bg-white px-4 text-sm font-semibold text-amber-900 outline-none hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60",
                className,
            )}
        >
            {isPending ? "Enviando..." : secondsLeft > 0 ? `Reenviar en ${secondsLeft} s` : "Reenviar correo"}
        </button>
    )
}