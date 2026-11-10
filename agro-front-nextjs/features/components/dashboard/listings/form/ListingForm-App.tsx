"use client"

import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MACHINE_GROUPS } from "@/features/constants/products/type-machine.constant"
import { LIST_COUNTRIES } from "@/features/constants/countries/countries"
import {
  listingFormSchema,
  MACHINE_ITEMS,
  type CreateListingPayload,
  type ListingFormInput,
  type ListingFormValues,
} from "@/features/schemas/listings/listing.schema"
import { SegmentedControl } from "./SegmentedControl"
import { FormSection } from "./form-section"
import { 
  CONDITION_OPTIONS, CURRENCY_OPTIONS, OPERATION_OPTIONS, RENT_PERIOD_OPTIONS, RENT_PERIOD_UNIT,
} from "@/features/constants/listings/listings.constants"

const DESCRIPTION_MAX = 5000

//- El form no sabe de Server Actions ni de rutas: informa el resultado y listo
export type ListingSubmitResult = { ok: true } | { ok: false; message: string }

type ListingFormProps = {
  onSubmit: (payload: CreateListingPayload) => Promise<ListingSubmitResult>
  defaultLocation?: string
  defaultCountry?: string
  /** Al editar, trae los datos de la publicación */
  defaultValues?: Partial<ListingFormInput>
  submitLabel?: string
  submittingLabel?: string
}

export function ListingFormApp({
  onSubmit,
  defaultLocation,
  defaultCountry,
  defaultValues,
  submitLabel = "Publicar",
  submittingLabel = "Publicando…",
}: ListingFormProps) {

  //- true tras un alta exitosa: mantiene el botón apagado mientras se navega (evita un doble envío)
  const [done, setDone] = useState(false)

  const form = useForm<ListingFormInput, unknown, ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    mode: "onTouched",
    defaultValues: {
      operation: "SALE",
      rentPeriod: undefined,
      machineType: "",
      title: "",
      condition: "USED",
      year: "",
      hours: "",
      horsepower: "",
      currency: "USD",
      price: "",
      description: "",
      country: defaultCountry ?? "",
      location: defaultLocation ?? "",
      ...defaultValues,
    },
  })

  const { control, formState } = form

  const operation = useWatch({ control, name: "operation" })
  const rentPeriod = useWatch({ control, name: "rentPeriod" })
  const currency = useWatch({ control, name: "currency" })
  const description = useWatch({ control, name: "description" })

  const isRent = operation === "RENT"
  const busy = formState.isSubmitting || done

  async function submit(values: ListingFormValues) {
    try {
      const result = await onSubmit({
        ...values,
        rentPeriod: values.operation === "RENT" ? values.rentPeriod : undefined,
      })

      if (!result.ok) {
        form.setError("root", { message: result.message })
        return
      }

      setDone(true)
    } catch {
      form.setError("root", { message: "No pudimos crear la publicación. Probá de nuevo." })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate className="w-full">
      {/* Un fieldset deshabilitado apaga todos los controles mientras se envía */}
      <fieldset disabled={busy} className="m-0 min-w-0 space-y-6 border-0 p-0">

        {/* Tipo de publicación */}
        <FormSection
          title="Tipo de publicación"
          description="Elegí si vendés o alquilás la máquina."
        >
          <Controller
            name="operation"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Operación</FieldLabel>
                <SegmentedControl
                  ariaLabel="Operación"
                  options={OPERATION_OPTIONS}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    if (value === "SALE") {
                      form.setValue("rentPeriod", undefined)
                      form.clearErrors("rentPeriod")
                    }
                  }}
                />
              </Field>
            )}
          />

          {isRent && (
            <Controller
              name="rentPeriod"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Período de alquiler</FieldLabel>
                  <SegmentedControl
                    ariaLabel="Período de alquiler"
                    options={RENT_PERIOD_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}
        </FormSection>

        {/* Datos de la máquina */}
        <FormSection title="Datos de la máquina">
          <Controller
            name="machineType"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="machineType">Tipo de máquina</FieldLabel>
                <Select
                  items={MACHINE_ITEMS}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id="machineType"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Elegí una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {MACHINE_GROUPS.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.items.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="title">Título</FieldLabel>
                <Input
                  {...field}
                  id="title"
                  placeholder="Ej: John Deere 6155J con pala frontal"
                  maxLength={120}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Condición</FieldLabel>
                <SegmentedControl
                  ariaLabel="Condición"
                  options={CONDITION_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              </Field>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <Controller
              name="year"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="year">Año</FieldLabel>
                  <Input
                    {...field}
                    id="year"
                    inputMode="numeric"
                    placeholder="2019"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="hours"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="hours">
                    Horas de uso <span className="text-muted-foreground">(opcional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="hours"
                    inputMode="numeric"
                    placeholder="3200"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="horsepower"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="horsepower">
                    Potencia (HP) <span className="text-muted-foreground">(opcional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="horsepower"
                    inputMode="numeric"
                    placeholder="155"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FormSection>

        {/* Precio */}
        <FormSection title="Precio">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Moneda</FieldLabel>
                <SegmentedControl
                  ariaLabel="Moneda"
                  options={CURRENCY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              </Field>
            )}
          />

          <Controller
            name="price"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="price">
                  {isRent ? "Precio de alquiler" : "Precio de venta"}
                </FieldLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground">
                    {currency}
                  </span>
                  <Input
                    {...field}
                    id="price"
                    inputMode="decimal"
                    placeholder="78500"
                    className="pl-14"
                    aria-invalid={fieldState.invalid}
                  />
                </div>
                {isRent && rentPeriod && (
                  <FieldDescription>Por {RENT_PERIOD_UNIT[rentPeriod]}</FieldDescription>
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FormSection>

        {/* Descripción y ubicación */}
        <FormSection title="Descripción y ubicación">
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Textarea
                  {...field}
                  id="description"
                  rows={6}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Estado general, mantenimiento, accesorios incluidos, motivo de venta..."
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription className="text-right tabular-nums">
                  {description.length}/{DESCRIPTION_MAX}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country">País de la máquina</FieldLabel>
                  <Select
                    items={LIST_COUNTRIES}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id="country"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder="Elegí un país" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIST_COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="location"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="location">Ciudad o zona</FieldLabel>
                  <Input
                    {...field}
                    id="location"
                    placeholder="Durazno"
                    maxLength={120}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FormSection>

        {formState.errors.root && (
          <p
            role="alert"
            className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formState.errors.root.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={busy}
            className="rounded-sm bg-teal-900 px-6 text-white hover:bg-teal-800"
          >
            {busy ? submittingLabel : submitLabel}
          </Button>
        </div>

      </fieldset>
    </form>
  )
}