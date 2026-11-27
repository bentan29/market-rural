"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { verifyEmailAction } from "@/features/actions/auth/email-verification.action"
import { useAuth } from "@/features/providers/AuthProvider"
import { fetchMe } from "@/lib/api"
import { ResendVerificationButton } from "./ResendVerificationButton"

type State =
    | { status: "idle" }
    | { status: "success"; next: string | null }
    | { status: "error"; message: string }

//- Solo rutas internas (el backend ya la validó, pero acá se vuelve a comprobar antes de enlazar)
const safeNext = (next: string | null) => (next && /^\/(?!\/)/.test(next) ? next : "/dashboard")

const linkButton =
    "inline-flex h-11 items-center justify-center rounded-sm bg-brand px-6 text-sm font-semibold text-brand-foreground outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-lime-400/60"

export function VerifyEmailCard({ token }: { token: string | null }) {
    const { user, setUser } = useAuth()
    const [state, setState] = useState<State>({ status: "idle" })
    const [isPending, startTransition] = useTransition()

    function confirm() {
        if (!token) return

        startTransition(async () => {
            const res = await verifyEmailAction(token)

            if (!res.ok) {
                setState({ status: "error", message: res.message })
                return
            }

            //- Saca el token de la barra de direcciones y del historial: ya no sirve y no tiene por qué quedar a la vista
            window.history.replaceState(null, "", "/verificar-email")

            //- Si hay sesión en este navegador, se actualiza para que desaparezcan los avisos
            try {
                if (user) setUser(await fetchMe())
            } catch {
                //- No es grave: el aviso desaparece en la próxima carga
            }

            setState({ status: "success", next: res.next })
        })
    }

    return (
        <div className="w-full max-w-md rounded-sm border border-white/15 bg-white/5 p-8 text-white backdrop-blur-md">
            <span className="block w-fit border-l-2 border-brand pl-3 text-xs font-semibold tracking-[0.25em] text-white/80 uppercase">
                MarketRural
            </span>

            {state.status === "success" ? (
                <div role="status" className="mt-5 space-y-5">
                    <h1 className="text-2xl font-bold leading-tight">
                        Email <span className="text-lime-400">verificado.</span>
                    </h1>
                    <p className="text-white/75">Ya podés enviar consultas y registrarte como vendedor.</p>
                    <Link href={safeNext(state.next)} className={linkButton}>
                        Continuar
                    </Link>
                </div>
            ) : state.status === "error" ? (
                <div role="alert" className="mt-5 space-y-5">
                    <h1 className="text-2xl font-bold leading-tight">No pudimos verificar tu email</h1>
                    <p className="text-white/75">{state.message}</p>

                    {user ? (
                        <ResendVerificationButton next="/dashboard" />
                    ) : (
                        <Link href="/login?next=/dashboard" className={linkButton}>
                            Iniciar sesión para pedir otro enlace
                        </Link>
                    )}
                </div>
            ) : token ? (
                <div className="mt-5 space-y-5">
                    <h1 className="text-2xl font-bold leading-tight">Confirmá tu email</h1>
                    <p className="text-white/75">Un clic y tu cuenta queda activa.</p>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={isPending}
                        className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-brand px-6 text-sm font-semibold text-brand-foreground outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-lime-400/60 disabled:opacity-60"
                    >
                        {isPending ? "Confirmando..." : "Confirmar mi email"}
                    </button>
                </div>
            ) : (
                <div className="mt-5 space-y-5">
                    <h1 className="text-2xl font-bold leading-tight">Revisá tu correo</h1>
                    <p className="text-white/75">
                        Abrí el enlace que te enviamos para confirmar tu email. Si no te llegó, revisá el correo no deseado
                        {user ? " o pedí uno nuevo." : "."}
                    </p>
                    {user && <ResendVerificationButton next="/dashboard" />}
                </div>
            )}
        </div>
    )
}