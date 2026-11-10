'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { registerSchema, RegisterUseValues } from "@/features/schemas/accounts/register.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LoaderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { authErrorClass, authInputClass, authLabelClass } from "../styles/auth-styles"
import { registerUserAction } from "@/features/actions/public/auth/register.action"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"



export const RegisterFormApp = () => {

    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter()

    const form = useForm<RegisterUseValues>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched",
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        }
    })

    const onSubmit = (data: RegisterUseValues) => {
        startTransition(async () => {
            try {
                const res = await registerUserAction(data)

                if(!res?.ok) {
                    console.log(`error ${res?.message}`)
                    toast.add({
                        type: "error",
                        description: "error " + res?.message
                    })

                    return
                }

                toast.add({
                    type: "succes",
                    description: "Cuenta Creada"
                })

                router.push('/login')

            } catch (error: unknown) {
                toast.add({
                    type: "error",
                    description: "'Ocurrió un error inesperado'.",
                })
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
                            MarketRural · <span className="rounded-xs bg-brand px-2 py-0.5 text-white">Crear cuenta</span>
                        </span>

                        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight">
                            Sumate al marketplace{" "}
                            <span className="text-lime-400">de maquinaria rural.</span>
                        </h1>

                        <FieldDescription className="text-white/70">
                            ¿Ya tenés una cuenta?{" "}
                            <Link href="/login" className="font-medium text-lime-400 underline underline-offset-4 hover:text-lime-300">
                                Iniciar sesión
                            </Link>
                        </FieldDescription>
                    </div>

                    <Controller
                        name="fullName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass }>Nombre</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="Juan Pérez"
                                    autoComplete="name"
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass }
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass } />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass }>Email</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="email"
                                    placeholder="tu@email.com"
                                    autoComplete="email"
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass }
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass } />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass }>Contraseña</FieldLabel>
                                <InputGroup className="border-white/20 bg-white/10 has-[[data-slot=input-group-control]:focus-visible]:border-brand has-[[data-slot=input-group-control]:focus-visible]:ring-brand/40">
                                    <InputGroupInput
                                        {...field}
                                        id={field.name}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
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
                                <FieldDescription className="text-white/60">
                                    Mínimo 8 caracteres, con mayúscula, minúscula y número.
                                </FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass } />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="confirmPassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass }>Confirmar contraseña</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass }
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass } />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="acceptTerms"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                <Checkbox
                                    id={field.name}
                                    name={field.name}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className="border-white/40 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-white"
                                />
                                <div className="grid gap-1">
                                    <FieldLabel htmlFor={field.name} className="font-normal text-white/80">
                                        Acepto los{" "}
                                        <Link href="/terminos" className="text-lime-400 underline underline-offset-4 hover:text-lime-300">
                                            términos y condiciones
                                        </Link>
                                    </FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass } />}
                                </div>
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
                        {isPending ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>

                </FieldGroup>
            </form>

        </div>
    )
}