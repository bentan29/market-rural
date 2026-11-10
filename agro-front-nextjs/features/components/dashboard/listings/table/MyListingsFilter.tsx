'use client'

import { useEffect, useRef, useState, useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Sorting05Icon, Cancel01Icon, FilterHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LISTING_OPERATIONS, LISTING_SORTS, LISTING_STATUSES } from "@/features/Nuqs/private/private-listings-nuqs"
import { cn } from "@/lib/utils"
import { useListingsFilters } from "@/features/Nuqs/private/use-listings-filters"
import { OPERATION_LABEL, SORT_LABEL, STATUS_CONFIG } from "./inputs-labels"


function toggle<T extends string>(list: readonly T[], value: T): T[] {
    return list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
}

function Chip({ active, onClick, children }: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-3.5 text-xs font-semibold tracking-wide transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:ring-offset-1",
                active
                    ? "border-teal-950 bg-linear-to-b from-teal-800 to-teal-950 text-white shadow-md shadow-teal-950/25 hover:from-teal-700 hover:to-teal-900"
                    : "border-teal-900/15 bg-white text-teal-950 shadow-xs hover:-translate-y-px hover:border-teal-700 hover:bg-teal-50 hover:shadow-sm"
            )}
        >
            {children}
            {active && (
                <HugeiconsIcon icon={Cancel01Icon} size={13} className="text-teal-200" />
            )}
        </button>
    )
}

function GroupLabel({ children, count }: { children: React.ReactNode; count: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-teal-700" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-950">
                {children}
            </span>
            {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-900 px-1.5 text-[10px] font-bold text-white">
                    {count}
                </span>
            )}
            <div className="h-px flex-1 bg-linear-to-r from-teal-900/25 to-transparent" />
        </div>
    )
}

export function MyListingsFilters() {

    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useListingsFilters(startTransition)

    const [text, setText] = useState(filters.q)
    const sent = useRef(filters.q)

    useEffect(() => {
        if (text === sent.current) return

        const id = setTimeout(() => {
            sent.current = text
            setFilters({ q: text, page: 1 })
        }, 500)

        return () => clearTimeout(id)
    }, [text, setFilters])

    useEffect(() => {
        if (filters.q !== sent.current) {
            sent.current = filters.q
            setText(filters.q)
        }
    }, [filters.q])

    const hasFilters =
        filters.q !== "" ||
        filters.status.length > 0 ||
        filters.operation.length > 0

    const activeCount =
        (filters.q !== "" ? 1 : 0) +
        filters.status.length +
        filters.operation.length

    function clearFilters() {
        sent.current = ""
        setText("")
        setFilters({
            q: "",
            status: [],
            operation: [],
            page: 1,
        })
    }

    return (
        <section
            aria-busy={isPending}
            className="relative overflow-hidden rounded-sm border border-teal-950/20 bg-white shadow-lg shadow-teal-950/10"
        >
            {/* Progress bar */}
            <div
                className={cn(
                    "absolute inset-x-0 top-0 z-10 h-0.5 bg-linear-to-r from-transparent via-teal-300 to-transparent transition-opacity",
                    isPending ? "animate-pulse opacity-100" : "opacity-0"
                )}
            />

            {/* Header */}
            <div className="flex items-center justify-between bg-linear-to-br from-teal-600 via-teal-800 to-teal-900 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-sm bg-white/10 text-teal-100 ring-1 ring-white/20 backdrop-blur-sm">
                        <HugeiconsIcon icon={FilterHorizontalIcon} size={20} />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold tracking-tight">
                                Filtrar publicaciones
                            </h3>
                            {activeCount > 0 && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-300 px-1.5 text-[10px] font-bold text-teal-950">
                                    {activeCount}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-teal-100/70">
                            Encontrá rápidamente tus publicaciones
                        </p>
                    </div>
                </div>

                {hasFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 gap-1.5 rounded-md border border-white/15 text-xs font-medium text-teal-50 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={14} />
                        Limpiar
                    </Button>
                )}
            </div>

            <div className="space-y-6 bg-linear-to-b from-teal-50/60 to-white p-5">
                {/* Search and sort */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-teal-800"
                        />

                        <Input
                            type="search"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Buscar por título o descripción..."
                            maxLength={80}
                            className="h-11 rounded-md border-teal-900/20 bg-white pl-10 text-sm shadow-xs placeholder:text-teal-900/40 focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                        />
                    </div>

                    <div className="relative sm:w-60">
                        <HugeiconsIcon
                            icon={Sorting05Icon}
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-800"
                        />

                        <select
                            aria-label="Ordenar por"
                            value={filters.sort}
                            onChange={(e) =>
                                setFilters({
                                    sort: e.target.value as (typeof LISTING_SORTS)[number],
                                    page: 1,
                                })
                            }
                            className="h-11 w-full appearance-none rounded-md border border-teal-900/20 bg-white pl-10 pr-3 text-sm font-medium text-teal-950 shadow-xs outline-none transition-all hover:border-teal-700 focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                        >
                            {LISTING_SORTS.map((sort) => (
                                <option key={sort} value={sort}>
                                    {SORT_LABEL[sort]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status filters */}
                <div className="space-y-3">
                    <GroupLabel count={filters.status.length}>Estado</GroupLabel>

                    <div className="flex flex-wrap gap-2">
                        {LISTING_STATUSES.map((status) => (
                            <Chip
                                key={status}
                                active={filters.status.includes(status)}
                                onClick={() =>
                                    setFilters({
                                        status: toggle(filters.status, status),
                                        page: 1,
                                    })
                                }
                            >
                                {STATUS_CONFIG[status].label}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Operation filters */}
                <div className="space-y-3">
                    <GroupLabel count={filters.operation.length}>Operación</GroupLabel>

                    <div className="flex flex-wrap gap-2">
                        {LISTING_OPERATIONS.map((operation) => (
                            <Chip
                                key={operation}
                                active={filters.operation.includes(operation)}
                                onClick={() =>
                                    setFilters({
                                        operation: toggle(filters.operation, operation),
                                        page: 1,
                                    })
                                }
                            >
                                {OPERATION_LABEL[operation]}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer / updating indicator */}
            <div className="flex min-h-9 items-center justify-end border-t border-teal-950/10 bg-teal-950/3 px-5 py-2">
                {isPending && (
                    <span className="flex items-center gap-2 text-xs font-medium text-teal-900">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-600 opacity-60" />
                            <span className="relative inline-flex size-2 rounded-full bg-teal-700" />
                        </span>
                        Actualizando resultados...
                    </span>
                )}
            </div>
        </section>
    )
}