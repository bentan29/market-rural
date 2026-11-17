'use client'

import { useState } from "react"
import Link from "next/link"
import { LoaderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tone = "default" | "destructive"

type BaseProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  icon?: IconSvgElement
  /** destructive: para acciones que cuesta deshacer (cancelar, borrar) */
  tone?: Tone
  actionLabel: string
  cancelLabel?: string
}

//- O el botón principal es un enlace (href), o ejecuta algo (onConfirm): nunca los dos
type Props = BaseProps &
  (
    | { href: string; onConfirm?: never }
    | { onConfirm: () => void | Promise<void>; href?: never }
  )

const ICON_STYLE: Record<Tone, string> = {
  default: "bg-teal-950 text-lime-400",
  destructive: "bg-red-100 text-red-700",
}

const BRAND_ACTION = "rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover"

export function AlertDialogApp(props: Props) {
    
    const {
        open,
        onOpenChange,
        title,
        description,
        icon,
        tone = "default",
        actionLabel,
        cancelLabel = "Cancelar",
    } = props

    const [pending, setPending] = useState(false)

    //- Mientras se ejecuta la acción no se puede cerrar: evita dobles envíos y estados a medias
    const handleOpenChange = (next: boolean) => {
        if (pending && !next) return
        onOpenChange(next)
    }

    async function confirm() {
        if (!props.onConfirm) return

        setPending(true)
        try {
            await props.onConfirm()
            onOpenChange(false)
        } catch (error) {
            //- Si onConfirm lanza un error, el diálogo queda abierto para reintentar
            console.error("AlertDialogApp:", error)
        } finally {
            setPending(false)
        }
    }

    const destructive = tone === "destructive"

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="rounded-sm sm:max-w-md">
                {icon && (
                    <span className={cn("grid size-11 place-items-center rounded-sm", ICON_STYLE[tone])}>
                        <HugeiconsIcon icon={icon} size={22} strokeWidth={1.6} />
                    </span>
                )}

                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>

                    {props.href ? (
                        <Link
                            href={props.href}
                            onClick={() => onOpenChange(false)}
                            className={cn(
                                buttonVariants({ variant: destructive ? "destructive" : "default" }),
                                !destructive && BRAND_ACTION,
                            )}
                        >
                            {actionLabel}
                        </Link>
                    ) : (
                        <Button
                            type="button"
                            variant={destructive ? "destructive" : "default"}
                            className={cn(!destructive && BRAND_ACTION)}
                            disabled={pending}
                            onClick={confirm}
                        >
                            {pending && <HugeiconsIcon icon={LoaderIcon} className="mr-2 size-4 animate-spin" />}
                            {actionLabel}
                        </Button>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}