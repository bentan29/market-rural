"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

//- Agrega el valor si no está, lo saca si ya estaba
export function toggle<T extends string>(list: readonly T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

//- Sección numerada, plegable (details nativo: accesible y sin estado). Se abre sola si tiene filtros activos
export function FilterSection({
    index,
    title,
    count = 0,
    defaultOpen = false,
    children,
}: {
    index: number
    title: string
    count?: number
    defaultOpen?: boolean
    children: React.ReactNode
}) {
    return (
        <details open={defaultOpen || count > 0} className="group border-b border-white/10">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 outline-none select-none focus-visible:bg-white/5 [&::-webkit-details-marker]:hidden bg-black/10">
                <span className="font-mono text-[10px] tabular-nums text-lime-400">
                    {String(index).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">{title}</span>
                <span aria-hidden className="h-px flex-1 bg-white/10" />
                {count > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-xs bg-lime-400 px-1 text-[10px] font-bold text-teal-950">
                        {count}
                    </span>
                )}
                <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="shrink-0 text-white/50 group-open:rotate-180" />
            </summary>

            <div className="px-5 py-5">
                {children}
            </div>
        </details>
    )
}

export function FilterChip({
    active,
    onClick,
    children,
    className,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
    className?: string
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-sm border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-lime-400/40",
                active
                ? "border-lime-400 bg-lime-400 text-teal-950"
                : "border-white/15 bg-white/5 text-white/80 hover:border-white/40 hover:text-white",
                className,
            )}
        >
            {children}
        </button>
    )
}

//- Campo numérico: escribe en la URL al salir del campo o con Enter (no en cada tecla, que sería una consulta por dígito)
export function NumberField({
    label,
    value,
    onCommit,
    placeholder,
    prefix,
    suffix,
    min,
    max,
}: {
    label: string
    value: number | null
    onCommit: (value: number | null) => void
    placeholder?: string
    prefix?: string
    suffix?: string
    min: number
    max: number
}) {
    const [text, setText] = useState(value?.toString() ?? "")
    const committed = useRef(value)

    //- Si la URL cambia desde afuera (limpiar, botón atrás), el campo la sigue
    useEffect(() => {
        if (value !== committed.current) {
            committed.current = value
            setText(value?.toString() ?? "")
        }
    }, [value])

    function commit() {
        let next = text === "" ? null : Number(text)
        if (next !== null) next = Math.min(max, Math.max(min, next))
        setText(next?.toString() ?? "")

        if (next !== committed.current) {
            committed.current = next
            onCommit(next)
        }
    }

    return (
        <label className="block space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</span>

            <span className="relative block">
                {prefix && (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-[11px] text-white/45">
                        {prefix}
                    </span>
                )}

                <input
                    inputMode="numeric"
                    value={text}
                    placeholder={placeholder}
                    onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
                    onBlur={commit}
                    onKeyDown={(e) => e.key === "Enter" && commit()}
                    className={cn(
                        "h-10 w-full rounded-sm border border-white/15 bg-white/5 px-3 text-sm tabular-nums text-white outline-none placeholder:text-white/25 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20",
                        prefix && "pl-12",
                        suffix && "pr-10",
                    )}
                />

                {suffix && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[11px] text-white/45">
                        {suffix}
                    </span>
                )}
            </span>
        </label>
    )
}