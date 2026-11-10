'use client'

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authErrorClass, authInputClass, authLabelClass,} from "@/features/components/auth/styles/auth-styles"
import { useAuth } from "@/features/providers/AuthProvider"
import { fetchMe } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { sellerSchema, SellerValues } from "@/features/schemas/seller/register-seller.schema"
import { LIST_COUNTRIES } from "@/features/constants/countries/countries"
import { registerSellerAction } from "@/features/actions/private/seller/create-seller.action"

//- Select y textarea nativos, con el mismo aspecto "vidrio" que los inputs
const nativeFieldClass = `${authInputClass} w-full rounded-md border px-3 text-sm outline-none transition-colors focus-visible:ring-3`

type Props = {
    defaultValues?: Partial<SellerValues>
    /** Si viene, es una reactivación: cambian los textos y se avisa cuántas publicaciones vuelven */
    reactivation?: { listingsCount: number }
}

export const SellerFormApp = ({ defaultValues, reactivation }: Props) => {

    const { setUser } = useAuth()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<SellerValues>({
        resolver: zodResolver(sellerSchema),
        mode: "onTouched",
        defaultValues: {
            displayName: "",
            about: "",
            phone: "",
            whatsapp: "",
            website: "",
            country: "",
            location: "",
            ...defaultValues
        },
    })

    function onSubmit(values: SellerValues) {
        startTransition(async () => {
            try {
                const res = await registerSellerAction(values)

                if(!res.ok) {
                    //- Sesión vencida: al login, y de vuelta acá
                    if (res.status === 401) {
                        router.push("/login?next=/dashboard/registro-vendedor")
                        return
                    }
                    toast.add({ 
                        type: "error", 
                        description: res.message
                    })
                    return
                }

                //- Nest ya subió el rol a SELLER: lo traemos para que el sidebar cambie sin recargar
                setUser(res.user ?? (await fetchMe()))
                toast.add({ 
                    type: "success", 
                    description: reactivation ? "¡Perfil reactivado!" : "¡Ya sos vendedor!",
                })

                router.push("/dashboard")
                router.refresh()
            } catch (error: unknown) {
                console.error("Error al registrar vendedor:", error)

                toast.add({
                    type: "error",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Ocurrió un error inesperado",
                })
            }
        })
    }

  return (
        <div className="rounded-sm border border-white/15 bg-teal-950 p-6 text-white shadow-2xl backdrop-blur-md md:p-8">

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>

                {/* Encabezado, mismo lenguaje que el hero */}
                <div className="flex flex-col gap-4">
                    <span className="w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                        MarketRural · <span className="rounded-xs bg-brand px-2 py-0.5 text-white">Vendedor</span>
                    </span>

                    <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight">
                        {reactivation ? "Reactivá " : "Creá "}tu perfil{" "}
                        <span className="text-lime-400">de vendedor.</span>
                    </h1>

                    <FieldDescription className="text-white/70">
                        {reactivation
                            ? "Revisá tus datos y cambiá lo que quieras antes de reactivar."
                            : "Estos datos se muestran en tus publicaciones para que los compradores puedan contactarte."}
                    </FieldDescription>

                    {reactivation && reactivation.listingsCount > 0 && (
                        <p className="rounded-sm border border-lime-400/30 bg-lime-400/10 p-3 text-sm text-lime-300">
                            Tus {reactivation.listingsCount} publicaciones volverán a mostrarse al reactivar.
                        </p>
                    )}
                </div>

                <Controller
                    name="displayName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className={authLabelClass}>Nombre comercial</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                placeholder="Agro Máquinas del Sur"
                                autoComplete="organization"
                                disabled={isPending}
                                aria-invalid={fieldState.invalid}
                                className={authInputClass}
                            />
                            <FieldDescription className="text-white/60">
                                Puede ser tu nombre o el de tu empresa.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                        </Field>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="phone"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass}>Teléfono</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="tel"
                                    inputMode="tel"
                                    placeholder="+598 99 123 456"
                                    autoComplete="tel"
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={authInputClass}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <Controller
                    name="whatsapp"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name} className={authLabelClass}>
                            WhatsApp <span className="text-white/50">(opcional)</span>
                        </FieldLabel>
                        <Input
                            {...field}
                            id={field.name}
                            type="tel"
                            inputMode="tel"
                            placeholder="+598 99 123 456"
                            disabled={isPending}
                            aria-invalid={fieldState.invalid}
                            className={authInputClass}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                        </Field>
                    )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="country"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className={authLabelClass}>País</FieldLabel>
                                <select
                                    {...field}
                                    id={field.name}
                                    disabled={isPending}
                                    aria-invalid={fieldState.invalid}
                                    className={`${nativeFieldClass} h-9`}
                                >
                                    <option value="" className="bg-teal-950 text-white">Elegí un país</option>
                                    {LIST_COUNTRIES.map((c) => (
                                        <option key={c.value} value={c.value} className="bg-teal-950 text-white">
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="location"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className={authLabelClass}>Ubicación</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                placeholder="Ciudad, departamento"
                                autoComplete="address-level2"
                                disabled={isPending}
                                aria-invalid={fieldState.invalid}
                                className={authInputClass}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    name="website"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className={authLabelClass}>
                                Sitio web <span className="text-white/50">(opcional)</span>
                            </FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                type="url"
                                inputMode="url"
                                placeholder="https://tuempresa.com"
                                autoComplete="url"
                                disabled={isPending}
                                aria-invalid={fieldState.invalid}
                                className={authInputClass}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className={authErrorClass} />}
                        </Field>
                    )}
                />

                <Controller
                    name="about"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className={authLabelClass}>
                                Sobre vos <span className="text-white/50">(opcional)</span>
                            </FieldLabel>
                            <textarea
                                {...field}
                                id={field.name}
                                rows={4}
                                placeholder="Contá desde cuándo trabajás con maquinaria, qué marcas manejás..."
                                disabled={isPending}
                                aria-invalid={fieldState.invalid}
                                className={`${nativeFieldClass} min-h-24 resize-y py-2`}
                            />
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
                    {isPending
                        ? (reactivation ? "Reactivando..." : "Creando perfil...")
                        : (reactivation ? "Reactivar mi perfil" : "Crear perfil de vendedor")}
                </Button>

            </FieldGroup>
        </form>

        </div>
  )
}