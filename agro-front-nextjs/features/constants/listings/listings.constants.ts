import { SegmentedOption } from "@/features/components/dashboard/listings/form/SegmentedControl"
import { ListingFormInput } from "@/features/schemas/listings/listing.schema"

export const OPERATION_OPTIONS = [
  { value: "SALE", label: "Venta" },
  { value: "RENT", label: "Alquiler" },
] as const satisfies readonly SegmentedOption<ListingFormInput["operation"]>[]

export const RENT_PERIOD_OPTIONS = [
  { value: "DAY", label: "Por día" },
  { value: "WEEK", label: "Por semana" },
  { value: "MONTH", label: "Por mes" },
] as const satisfies readonly SegmentedOption<
  NonNullable<ListingFormInput["rentPeriod"]>
>[]

export const CONDITION_OPTIONS = [
  { value: "NEW", label: "Nueva" },
  { value: "USED", label: "Usada" },
] as const satisfies readonly SegmentedOption<ListingFormInput["condition"]>[]

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "UYU", label: "UYU" },
  { value: "ARS", label: "ARS" },
  { value: "BRL", label: "BRL" }, //- Peso brasilero real
  { value: "PYG", label: "PYG" }, //- Peso paraguayo guarani
] as const satisfies readonly SegmentedOption<ListingFormInput["currency"]>[]

export const RENT_PERIOD_UNIT = {
  DAY: "día",
  WEEK: "semana",
  MONTH: "mes",
} as const
