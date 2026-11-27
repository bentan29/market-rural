"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon, Message01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { sendInquiryAction } from "@/features/actions/private/inquiries/send-inquiry.action"
import { authErrorClass, authInputClass, authLabelClass } from "@/features/components/auth/styles/auth-styles"
import { useAuth } from "@/features/providers/AuthProvider"
import { inquirySchema, type InquiryValues } from "@/features/schemas/inquiries/inquiry.schema"
import { ResendVerificationButton } from "../auth/verification/ResendVerificationButton"
import { cn } from "@/lib/utils"
import { AlertDialogApp } from "../global/alertDialog/AlertDialogApp"

const textareaClass = `${authInputClass} min-h-28 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3`

//- Los campos de solo lectura se ven un poco apagados, para que no parezcan editables
const readOnlyClass = cn(authInputClass, "cursor-default opacity-70")

const draftKey = (slug: string) => `inquiry-draft:${slug}`

type Props = {
    slug: string
    listingTitle: string
    sellerName: string
}

export function ContactForm({ slug, listingTitle, sellerName }: Props) {

    const { user, status } = useAuth()
    const [isPending, startTransition] = useTransition()
    const [sent, setSent] = useState(false)
    const [loginOpen, setLoginOpen] = useState(false)
    const [loginHref, setLoginHref] = useState("/login")

    const needsVerification = !!user && user.emailVerified === false

    //- El mismo criterio que usa el backend al guardar la consulta: es lo que va a ver el vendedor
    const displayName = user ? user.fullName?.trim() || user.email.split("@")[0] : ""

    const form = useForm<InquiryValues>({
        resolver: zodResolver(inquirySchema),
        mode: "onTouched",
        defaultValues: {
            phone: "",
            message: `Hola, me interesa "${listingTitle}". ¿Sigue disponible?`,
            company: "",
        },
    })

    //- Al volver del login se recupera lo que la persona había escrito
    useEffect(() => {
        if (!user) return

        try {
            const raw = sessionStorage.getItem(draftKey(slug))
            if (!raw) return

            const draft = JSON.parse(raw) as { message?: string; phone?: string }
            form.reset({ phone: draft.phone ?? "", message: draft.message ?? "", company: "" })
            sessionStorage.removeItem(draftKey(slug))
        } catch {
            //- Sin sessionStorage (modo privado, por ejemplo): se sigue sin borrador
        }
    }, [user, slug, form])

    //- Guarda lo escrito y pide iniciar sesión; después del login vuelve a esta misma página
    function askForLogin() {
        try {
            const { message, phone } = form.getValues()
            sessionStorage.setItem(draftKey(slug), JSON.stringify({ message, phone }))
        } catch {
            //- Sin sessionStorage: el borrador no se conserva
        }

        const here = window.location.pathname + window.location.search
        setLoginHref(`/login?next=${encodeURIComponent(here)}`)
        setLoginOpen(true)
    }

    function onSubmit(values: InquiryValues) {
        //- Todavía no sabemos si hay sesión: no mostramos el aviso de "iniciá sesión" por error
        if (status === "loading") return

        if (!user) {
            askForLogin()
            return
        }

        startTransition(async () => {
            try {
                const res = await sendInquiryAction(slug, values)

                if (!res.ok) {
                    if (res.status === 401) {
                        askForLogin() // la sesión venció
                        return
                    }
                    toast.add({ type: "error", description: res.message })
                    return
                }

                setSent(true)
            } catch {
                toast.add({ type: "error", description: "Ocurrió un error inesperado" })
            }
        })
    }

    if (sent) {
        return (
            <div role="status" className="rounded-sm bg-teal-950 p-6 text-white">
                <span className="block w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                    Consulta enviada
                </span>
                <p className="mt-4 text-lg font-semibold leading-snug">
                    {sellerName} recibió tu consulta <span className="text-lime-400">y te va a responder a tu email.</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <Link
                        href="/dashboard/consultas"
                        className="font-semibold text-lime-400 underline underline-offset-4 outline-none hover:text-lime-300 focus-visible:text-lime-300"
                    >
                        Ver mis consultas
                    </Link>
                    <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="text-white/70 underline underline-offset-4 outline-none hover:text-white focus-visible:text-lime-300"
                    >
                        Enviar otra
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-sm bg-primary p-6 text-white">
            <AlertDialogApp
                open={loginOpen}
                onOpenChange={setLoginOpen}
                icon={Message01Icon}
                title="Iniciá sesión para consultar"
                description="Necesitás una cuenta para escribirle al vendedor. Lo que escribiste se conserva, y tus consultas quedan guardadas en tu panel."
                href={loginHref}
                actionLabel="Iniciar sesión"
            />

            {needsVerification && (
                <div role="alert" className="mb-5 space-y-3 rounded-sm border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
                    <p>Verificá tu email para enviar consultas. Te enviamos un enlace a {user.email}.</p>
                    <ResendVerificationButton />
                </div>
            )}

            <span className="block w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                Consultar
            </span>
            <h2 className="mt-3 text-xl font-semibold leading-tight">Escribile a {sellerName}</h2>

            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-5">
                <FieldGroup>

                    {/* Campo trampa: fuera de pantalla, sin foco y ignorado por lectores de pantalla */}
                    <div aria-hidden className="absolute -left-2499.75 h-0 w-0 overflow-hidden">
                        <input type="text" tabIndex={-1} autoComplete="off" {...form.register("company")} />
                    </div>

                    {/* Con sesión: los datos de la cuenta, de solo lectura. No son parte del formulario:
                        el servidor los toma de la sesión, no de lo que se envíe */}
                    {user && (
                        <>
                            <Field>
                                <FieldLabel htmlFor="inquiry-name" className={authLabelClass}>Nombre</FieldLabel>
                                <Input
                                    id="inquiry-name"
                                    value={displayName}
                                    readOnly
                                    autoComplete="off"
                                    className={readOnlyClass}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="inquiry-email" className={authLabelClass}>Email</FieldLabel>
                                <Input
                                    id="inquiry-email"
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    autoComplete="off"
                                    className={readOnlyClass}
                                />
                            </Field>

                            <FieldDescription className="-mt-1 text-xs text-white/55">
                                Estos datos salen de tu cuenta, y es a este email que te va a responder el vendedor.
                            </FieldDescription>
                        </>
                    )}

                    <Controller
                        name="phone"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="inquiry-phone" className={authLabelClass}>Teléfono</FieldLabel>
                                <Input
                                    {...field}
                                    id="inquiry-phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="+598 99 123 456"
                                    required
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="message"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="inquiry-message" className={authLabelClass}>Mensaje</FieldLabel>
                                <textarea
                                    {...field}
                                    id="inquiry-message"
                                    rows={4}
                                    maxLength={1000}
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={textareaClass}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <FieldDescription className="text-xs text-white/55">
                        El vendedor recibe tu nombre, tu email y tu teléfono para poder responderte.
                    </FieldDescription>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isPending || needsVerification}
                        className="w-full bg-brand text-brand-foreground hover:bg-brand-hover"
                    >
                        {isPending && <HugeiconsIcon icon={LoaderIcon} className="mr-2 size-4 animate-spin" />}
                        {isPending ? "Enviando..." : "Enviar consulta"}
                    </Button>

                </FieldGroup>
            </form>
        </div>
    )
}