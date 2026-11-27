//- Import directo por bandera (modo que documenta la librería): así solo entran al paquete las 4 que usamos,
//- y no las 249 del índice general
import AR from "country-flag-icons/react/3x2/AR"
import BR from "country-flag-icons/react/3x2/BR"
import PY from "country-flag-icons/react/3x2/PY"
import UY from "country-flag-icons/react/3x2/UY"
import type { CatalogCountry } from "@/features/constants/catalog/countries"
import { cn } from "@/lib/utils"

//- El tipo sale de la propia librería (todas sus banderas comparten el mismo): así no depende de cómo declare sus props
type FlagComponent = typeof UY

//- Tipado contra CATALOG_COUNTRIES: si sumás un país y te olvidás de su bandera, TypeScript marca el error
const FLAGS: Record<CatalogCountry["code"], FlagComponent> = { UY, AR, BR, PY }

//- El código llega como texto (por ejemplo, el país de un vendedor): esto comprueba que haya bandera, sin castear
const hasFlag = (code: string): code is CatalogCountry["code"] => Object.hasOwn(FLAGS, code)

type Props = {
    /** Código ISO del país: "UY", "AR"... */
    code: string
    className?: string
}

//- Decorativa: el nombre del país siempre va escrito al lado, por eso está oculta para lectores de pantalla
export function CountryFlag({ code, className }: Props) {
    if (!hasFlag(code)) return null

    const Flag = FLAGS[code]

    return (
        <Flag
            aria-hidden="true"
            //- El borde fino evita que las banderas claras (Argentina) se pierdan sobre un fondo blanco
            className={cn("h-3.5 w-[21px] shrink-0 rounded-[2px] ring-1 ring-black/15", className)}
        />
    )
}