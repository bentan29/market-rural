'use client'

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { loginSchema, LoginValues } from "@/features/schemas/accounts/login.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LoaderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { authErrorClass, authInputClass, authInputGroupClass, authLabelClass } from "../styles/auth-styles"
import { loginUserAction } from "@/features/actions/public/auth/login.action"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/providers/AuthProvider"

type Props = {
    /** Ruta a la que volver después de ingresar (la agrega proxy.ts como ?next=) */
    next?: string
}

//- Solo rutas internas: "//evil.com" o "https://..." serían un redirect abierto
const safeNext = (next?: string) =>
    next && next.startsWith('/') && !next.startsWith('//') ? next : '/'

export const LoginFormApp = ({ next }: Props) => {

    const { setUser } = useAuth()
    
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: LoginValues) {
        startTransition(async () => {
            try {
                const res = await loginUserAction(values)

                if (!res.ok) {
                    toast.add({ type: "error", description: res.message })
                    return
                }

                setUser(res.user)
                toast.add({ type: "success", description: "Login exitoso" })

                router.push(safeNext(next))
                router.refresh()
            } catch {
                toast.add({ type: "error", description: "Ocurrió un error inesperado" })
            }
        })
    }

    return (
        <div className="rounded-xl border border-white/15 bg-teal-950/60 p-6 text-white shadow-2xl backdrop-blur-md md:p-8">

            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FieldGroup>

                    {/* Encabezado, mismo lenguaje que el hero */}
                    <div className="flex flex-col gap-4">
                        <span className="w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                            MarketRural · <span className="rounded-xs bg-brand px-2 py-0.5 text-white">Ingresar</span>
                        </span>

                        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight">
                            Bienvenido de nuevo a{" "}
                            <span className="text-lime-400">tu marketplace.</span>
                        </h1>

                        <FieldDescription className="text-white/70">
                            ¿Todavía no tenés cuenta?{" "}
                            <Link href="/registrarme" className="font-medium text-lime-400 underline underline-offset-4 hover:text-lime-300">
                                Registrate
                            </Link>
                        </FieldDescription>
                    </div>

                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass}>Email</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="email"
                                    placeholder="tu@email.com"
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
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor={field.name} className={authLabelClass}>Contraseña</FieldLabel>
                                    <Link
                                        href="/recuperar-password"
                                        className="text-xs text-lime-400 underline-offset-4 hover:text-lime-300 hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <InputGroup className={authInputGroupClass}>
                                    <InputGroupInput
                                        {...field}
                                        id={field.name}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        disabled={isPending}
                                        aria-invalid={fieldState.invalid}
                                        className="text-white placeholder:text-white/40"
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                            type="button"
                                            size="icon-xs"
                                            className="text-white/70 hover:bg-white/10 hover:text-white"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        >
                                            <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} />
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-brand text-brand-foreground hover:bg-brand-hover"
                        disabled={isPending}
                    >
                        {isPending && <HugeiconsIcon icon={LoaderIcon} className="mr-2 size-4 animate-spin" />}
                        {isPending ? "Ingresando..." : "Iniciar sesión"}
                    </Button>

                </FieldGroup>
            </form>

        </div>
    )
}