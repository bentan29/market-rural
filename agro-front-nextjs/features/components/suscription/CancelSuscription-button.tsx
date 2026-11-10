'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cancelSuscriptionAction } from "@/features/actions/private/suscription/cancel-suscription.action"
import { useAuth } from "@/features/providers/AuthProvider"
import { fetchMe } from "@/lib/api"

export const CancelSuscriptionbutton = () => {

    const { setUser } = useAuth()
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [isPending, startTransition] = useTransition()

    function onConfirm() {
        startTransition(async () => {
            try {
                const res = await cancelSuscriptionAction()

                if (!res.ok) {
                    if (res.status === 401) {
                        router.push("/login?next=/dashboard/suscripcion")
                        return
                    }
                    toast.add({ type: "error", description: res.message })
                    return
                }

                //- El rol ya volvió a USER: lo reflejamos para que el sidebar cambie sin recargar
                setUser(await fetchMe())
                toast.add({ type: "success", description: "Tu suscripción fue cancelada" })

                router.push("/dashboard")
                router.refresh()
            } catch {
                toast.add({ type: "error", description: "Ocurrió un error inesperado" })
            }
        })
    }

    if (!confirming) {
        return (
            <Button variant="outline" onClick={() => setConfirming(true)}>
                Cancelar suscripción
            </Button>
        )
    }

    return (
        <div role="alertdialog" className="space-y-3 rounded-sm border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium">¿Querés cancelar tu suscripción?</p>
            <p className="text-sm text-muted-foreground">
                Dejarás de ser vendedor y tus publicaciones dejarán de mostrarse. No se borra nada:
                si volvés a registrarte como vendedor, tus datos y publicaciones se recuperan.
            </p>
            <div className="flex gap-2">
                <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                    {isPending ? "Cancelando..." : "Sí, cancelar"}
                </Button>
                <Button variant="outline" onClick={() => setConfirming(false)} disabled={isPending}>
                    Volver
                </Button>
            </div>
        </div>
    )
}