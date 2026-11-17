'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/providers/AuthProvider"
import { fetchMe } from "@/lib/api"
import { cancelSuscriptionAction } from "@/features/actions/private/suscription/cancel-suscription.action"
import { AlertDialogApp } from "../global/alertDialog/AlertDialogApp"

export const CancelSuscriptionbutton = () => {
    const { setUser } = useAuth()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    async function cancel() {
        const res = await cancelSuscriptionAction()

        if (!res.ok) {
            if (res.status === 401) {
                router.push("/login?next=/dashboard/suscripcion")
                return
            }
            toast.add({ type: "error", description: res.message })
            throw new Error(res.message) // lanzar el error deja el diálogo abierto
        }

        //- El rol ya volvió a USER: lo reflejamos para que el sidebar cambie sin recargar
        setUser(await fetchMe())
        toast.add({ type: "success", description: "Tu suscripción fue cancelada" })
        router.push("/dashboard")
        router.refresh()
    }

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                Cancelar suscripción
            </Button>

            <AlertDialogApp
                open={open}
                onOpenChange={setOpen}
                tone="destructive"
                icon={Cancel01Icon}
                title="¿Cancelar tu suscripción?"
                description="Dejarás de ser vendedor y tus publicaciones dejarán de mostrarse. No se borra nada: si volvés a registrarte como vendedor, tus datos y publicaciones se recuperan."
                actionLabel="Sí, cancelar"
                cancelLabel="Volver"
                onConfirm={cancel}
            />
        </>
    )
}