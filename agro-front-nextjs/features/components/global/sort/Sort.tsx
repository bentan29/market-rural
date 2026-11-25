"use client"

import { useId } from "react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export type SortSelectProps<T extends string> = {
    value: T
    onChange: (value: T) => void
    options: readonly T[]
    labels: Record<T, string>
    /** Texto visible a la izquierda */
    label?: string
    /** Muestra un indicador mientras el servidor actualiza los resultados */
    pending?: boolean
    disabled?: boolean
    /** light: sobre fondo claro. dark: sobre el teal de la barra de filtros */
    tone?: "light" | "dark"
    className?: string
}

const TONES = {
    light: {
        label: "text-muted-foreground",
        select:
            "border-input bg-background text-foreground hover:border-foreground/30 focus-visible:border-brand focus-visible:ring-brand/30",
        option: undefined,
    },
    dark: {
        label: "text-white/55",
        select:
            "border-white/15 bg-white/5 text-white hover:border-white/40 focus-visible:border-lime-400 focus-visible:ring-lime-400/20",
        option: "bg-teal-950 text-white",
    },
} as const

//- Genérico: sirve para cualquier lista de opciones (publicaciones, mensajes, favoritos...) sin castear tipos
export function SortSelect<T extends string>({
    value,
    onChange,
    options,
    labels,
    label = "Ordenar por",
    pending = false,
    disabled = false,
    tone = "light",
    className,
}: SortSelectProps<T>) {
    const id = useId()
    const styles = TONES[tone]

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <label
                htmlFor={id}
                className={cn("shrink-0 text-xs font-semibold uppercase tracking-wider", styles.label)}
            >
                {label}
            </label>

            <div className="relative">
                <select
                    id={id}
                    value={value}
                    disabled={disabled}
                    aria-busy={pending}
                    onChange={(e) => {
                        //- Se busca entre las opciones reales en vez de castear el texto del <select>
                        const next = options.find((option) => option === e.target.value)
                        if (next !== undefined) onChange(next)
                    }}
                    className={cn(
                        "h-9 min-w-44 appearance-none rounded-sm border pr-9 pl-3 text-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50",
                        styles.select,
                    )}
                >
                    {options.map((option) => (
                        <option key={option} value={option} className={styles.option}>
                            {labels[option]}
                        </option>
                    ))}
                </select>

                <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={14}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 opacity-60"
                />
            </div>

            {pending && (
                <span role="status" className="size-1.5 shrink-0 animate-pulse rounded-full bg-lime-500">
                    <span className="sr-only">Actualizando resultados</span>
                </span>
            )}
        </div>
    )
}