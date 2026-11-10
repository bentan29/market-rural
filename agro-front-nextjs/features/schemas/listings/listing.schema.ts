import { z } from "zod"
import {
  MACHINE_GROUPS,
  type MachineItem,
  type MachineType,
} from "@/features/constants/products/type-machine.constant"
import { LIST_COUNTRIES } from "@/features/constants/countries/countries"

export const OPERATIONS = ["SALE", "RENT"] as const
export const RENT_PERIODS = ["DAY", "WEEK", "MONTH"] as const
export const CONDITIONS = ["NEW", "USED"] as const
//- Tienen que ser las mismas monedas que el enum Currency de Prisma
export const CURRENCIES = ["USD", "UYU", "ARS", "BRL", "PYG"] as const // BRL = Real Brasileño, PYG = Guarani Paraguayo

export const MACHINE_ITEMS: readonly MachineItem[] = MACHINE_GROUPS.flatMap<MachineItem>((group) => group.items)

//- Creamos un set solo con el value que obtenemos de MACHINE_ITEMS
const MACHINE_TYPE_SET = new Set<string>(
  MACHINE_ITEMS.map((item) => item.value)
)
const isMachineType = (value: string): value is MachineType => MACHINE_TYPE_SET.has(value)

const COUNTRY_SET = new Set<string>(LIST_COUNTRIES.map((country) => country.value))

const MAX_YEAR = new Date().getFullYear() + 1

//- Los inputs numéricos viven como string en el form y salen como number.
//- Se valida el FORMATO antes de convertir: así "Infinity", "1e3" o "78.500" no se cuelan.

const requiredInt = (requiredMessage: string) =>
  z.string().trim().transform((value, ctx) => {
    if (value === "") {
      ctx.addIssue({ code: "custom", message: requiredMessage })
      return z.NEVER
    }
    if (!/^\d+$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Ingresá solo números enteros" })
      return z.NEVER
    }
    return Number(value)
  })

const optionalInt = () =>
  z.string().trim().transform((value, ctx) => {
    if (value === "") return undefined
    if (!/^\d+$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Ingresá solo números enteros" })
      return z.NEVER
    }
    return Number(value)
  })

//- Hasta 2 decimales, sin puntos de miles ("78.500" se rechaza en vez de leerse como 78,5)
const requiredPrice = () =>
  z.string().trim().transform((value, ctx) => {
    if (value === "") {
      ctx.addIssue({ code: "custom", message: "Ingresá el precio" })
      return z.NEVER
    }
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Solo números, hasta 2 decimales y sin puntos de miles (ej: 78500)",
      })
      return z.NEVER
    }
    return Number(value.replace(",", "."))
  })

export const listingFormSchema = z
  .object({
    operation: z.enum(OPERATIONS),
    rentPeriod: z.enum(RENT_PERIODS).optional(),
    machineType: z.string().refine(isMachineType, { message: "Elegí el tipo de máquina" }),
    title: z.string().trim().min(5, "Mínimo 5 caracteres").max(120, "Máximo 120 caracteres"),
    condition: z.enum(CONDITIONS),
    year: requiredInt("Ingresá el año").pipe(
      z
        .number()
        .min(1900, "Año inválido")
        .max(MAX_YEAR, "Año inválido"),
    ),
    hours: optionalInt().pipe(
      z.number().min(0).max(200_000, "Cantidad de horas inválida").optional(),
    ),
    horsepower: optionalInt().pipe(
      z
        .number()
        .min(1, "La potencia debe ser mayor a 0")
        .max(5_000, "Potencia inválida")
        .optional(),
    ),
    currency: z.enum(CURRENCIES),
    price: requiredPrice().pipe(
      z
        .number()
        .positive("Ingresá un precio mayor a 0")
        .max(9_999_999_999.99, "El precio es demasiado alto"),
    ),
    description: z
      .string()
      .trim()
      .min(20, "Mínimo 20 caracteres")
      .max(5000, "Máximo 5000 caracteres"),
    country: z.string().refine((value) => COUNTRY_SET.has(value), { message: "Elegí el país" }),
    location: z.string().trim().min(2, "Ingresá la ubicación").max(120, "Máximo 120 caracteres"),
  })
  .superRefine((data, ctx) => {
    if (data.operation === "RENT" && !data.rentPeriod) {
      ctx.addIssue({
        code: "custom",
        path: ["rentPeriod"],
        message: "Elegí el período de alquiler",
      })
    }
  })

export type ListingFormInput = z.input<typeof listingFormSchema>

export type ListingFormValues = z.output<typeof listingFormSchema>

/** Lo que recibe el backend (CreateListingDto). */
export type CreateListingPayload = ListingFormValues