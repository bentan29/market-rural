"use client"

import { useEffect, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { sendInquiryAction } from "@/features/actions/public/inquiries/send-inquiry.action"
import { authErrorClass, authInputClass, authLabelClass } from "@/features/components/auth/styles/auth-styles"
import { useAuth } from "@/features/providers/AuthProvider"
import { inquirySchema, type InquiryValues } from "@/features/schemas/inquiries/inquiry.schema"

const textareaClass = `${authInputClass} min-h-28 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3`

type Props = {
    slug: string
    listingTitle: string
    sellerName: string
}

export function ContactForm({ slug, listingTitle, sellerName }: Props) {

    const { user } = useAuth()
    const [isPending, startTransition] = useTransition()
    const [sent, setSent] = useState(false)

    const form = useForm<InquiryValues>({
        resolver: zodResolver(inquirySchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            message: `Hola, me interesa "${listingTitle}". ¿Sigue disponible?`,
            company: "",
        },
    })

    //- Si hay sesión, se completan nombre y email (sin pisar lo que la persona ya escribió)
    useEffect(() => {
        if (!user) return
        if (!form.getValues("name")) form.setValue("name", user.fullName ?? "")
        if (!form.getValues("email")) form.setValue("email", user.email)
    }, [user, form])

    function onSubmit(values: InquiryValues) {
        startTransition(async () => {
            try {
                const res = await sendInquiryAction(slug, values)

                if (!res.ok) {
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
                    Mensaje enviado
                </span>
                <p className="mt-4 text-lg font-semibold leading-snug">
                    {sellerName} recibió tu consulta <span className="text-lime-400">y te va a responder a tu email.</span>
                </p>
                <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-4 text-sm text-white/70 underline underline-offset-4 outline-none hover:text-white focus-visible:text-lime-300"
                >
                    Enviar otro mensaje
                </button>
            </div>
        )
    }

    return (
        <div className="rounded-sm bg-primary p-6 text-white">
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

                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="inquiry-name" className={authLabelClass}>Nombre</FieldLabel>
                                <Input
                                    {...field}
                                    id="inquiry-name"
                                    autoComplete="name"
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="inquiry-email" className={authLabelClass}>Email</FieldLabel>
                                <Input
                                    {...field}
                                    id="inquiry-email"
                                    type="email"
                                    autoComplete="email"
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="phone"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="inquiry-phone" className={authLabelClass}>
                                    Teléfono <span className="text-white/50">(opcional)</span>
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="inquiry-phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="+598 99 123 456"
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
                        Tu nombre, email y teléfono se comparten con el vendedor para que pueda responderte.
                    </FieldDescription>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isPending}
                        className="w-full bg-brand text-brand-foreground hover:bg-brand-hover"
                    >
                        {isPending && <HugeiconsIcon icon={LoaderIcon} className="mr-2 size-4 animate-spin" />}
                        {isPending ? "Enviando..." : "Enviar mensaje"}
                    </Button>

                </FieldGroup>
            </form>
        </div>
    )
}