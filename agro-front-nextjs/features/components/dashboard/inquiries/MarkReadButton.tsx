"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "@/components/ui/toast"
import { markInquiryReadAction } from "@/features/actions/private/inquiries/mark-inquiry-read.action"

export function MarkReadButton({ id }: { id: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    function onClick() {
        startTransition(async () => {
            try {
                const res = await markInquiryReadAction(id)

                if (!res.ok) {
                    if (res.status === 401) {
                        router.push("/login?next=/dashboard/consultas")
                        return
                    }
                    toast.add({ type: "error", description: res.message })
                    return
                }

                router.refresh()
            } catch {
                toast.add({ type: "error", description: "Ocurrió un error inesperado" })
            }
        })
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isPending}
            className="text-xs font-semibold text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:underline disabled:opacity-50"
        >
            {isPending ? "..." : "Marcar como leída"}
        </button>
    )
}