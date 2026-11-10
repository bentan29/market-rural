"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import {
  CATALOG_CONDITIONS,
  CATALOG_CURRENCIES,
  CATALOG_OPERATIONS,
} from "@/features/Nuqs/catalog/catalog-search-params"
import { useCatalogFilters } from "@/features/Nuqs/catalog/use-catalog-filters"
import { CountrySwitcher } from "./CountrySwitcher"
import { TypeFilter } from "./TypeFilter"
import { FilterChip, FilterSection, NumberField, toggle } from "./Filter-atoms"

const OPERATION_LABEL = { SALE: "Venta", RENT: "Alquiler" } as const
const CONDITION_LABEL = { NEW: "Nueva", USED: "Usada" } as const
const YEAR_PRESETS = [2020, 2015, 2010] as const
const MAX_YEAR = new Date().getFullYear() + 1

//- Búsqueda de texto: escribe en la URL 500 ms después de dejar de tipear
function SearchField({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {

  const [text, setText] = useState(value)
  const sent = useRef(value)

  useEffect(() => {
    if (text === sent.current) return
    const id = setTimeout(() => {
      sent.current = text
      onCommit(text)
    }, 500)
    return () => clearTimeout(id)
  }, [text, onCommit])

  //- Si la URL cambia desde afuera (limpiar, atrás), el campo la sigue sin pisar lo que se está tipeando
  useEffect(() => {
    if (value !== sent.current) {
      sent.current = value
      setText(value)
    }
  }, [value])

  return (
    <label className="relative block">
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
      />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={80}
        placeholder="Marca, modelo o palabra clave"
        aria-label="Buscar en el catálogo"
        className="h-11 w-full rounded-sm border border-white/15 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
      />
    </label>
  )
}

export function CatalogFilters() {
    // const { isMobile, setOpenMobile } = useSidebar()
    const [isPending, startTransition] = useTransition()
    const [f, setF] = useCatalogFilters(startTransition)

    const commitSearch = useCallback((q: string) => setF({ q, page: 1 }), [setF])

    const activeCount =
        (f.q ? 1 : 0) +
        f.operation.length +
        f.type.length +
        f.condition.length +
        (f.yearFrom !== null || f.yearTo !== null ? 1 : 0) +
        (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
        (f.maxHours !== null ? 1 : 0) +
        (f.minHorsepower !== null || f.maxHorsepower !== null ? 1 : 0)

    //- Limpia todo menos el orden elegido
    const reset = () =>
        setF({
            q: "",
            operation: [],
            type: [],
            condition: [],
            yearFrom: null,
            yearTo: null,
            currency: null,
            minPrice: null,
            maxPrice: null,
            maxHours: null,
            minHorsepower: null,
            maxHorsepower: null,
            page: 1,
        })

    const currency = f.currency ?? "USD"

    return (
        <Sidebar
            
            collapsible="offcanvas"
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        >
            <SidebarHeader
                className="flex flex-row items-center justify-between gap-2 border-b border-white/10 bg-teal-950 px-5 py-3"
                aria-busy={isPending}
            >
                <p
                    className="flex w-fit items-center gap-2 text-xs text-white/55"
                    aria-live="polite"
                >
                    {isPending ? (
                        <>
                            <span className="size-1.5 animate-pulse rounded-full bg-lime-400" />
                            Actualizando resultados…
                        </>
                    ) : activeCount > 0 ? (
                        `${activeCount} ${activeCount === 1 ? "filtro activo" : "filtros activos"}`
                    ) : (
                        "Sin filtros activos"
                    )}
                </p>

                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={reset}
                        className="shrink-0 text-xs font-medium text-white/60 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:text-lime-300"
                    >
                        Limpiar
                    </button>
                )}
            </SidebarHeader>

            <SidebarContent className="gap-0 bg-teal-900">

                <div className="flex flex-col gap-4 p-3"> 

                    <SearchField value={f.q} onCommit={commitSearch} />

                    <CountrySwitcher />
                </div>

                <FilterSection index={1} title="Operación" count={f.operation.length} defaultOpen>
                    <div className="grid grid-cols-2 gap-2">
                        {CATALOG_OPERATIONS.map((operation) => (
                            <FilterChip
                                key={operation}
                                active={f.operation.includes(operation)}
                                onClick={() => setF({ operation: toggle(f.operation, operation), page: 1 })}
                                className="h-10 justify-center text-sm"
                            >
                                {OPERATION_LABEL[operation]}
                            </FilterChip>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection index={2} title="Tipo de máquina" count={f.type.length} defaultOpen>
                    <TypeFilter selected={f.type} onChange={(type) => setF({ type, page: 1 })} />
                </FilterSection>

                <FilterSection index={3} title="Condición" count={f.condition.length}>
                    <div className="grid grid-cols-2 gap-2">
                        {CATALOG_CONDITIONS.map((condition) => (
                            <FilterChip
                                key={condition}
                                active={f.condition.includes(condition)}
                                onClick={() => setF({ condition: toggle(f.condition, condition), page: 1 })}
                                className="h-10 justify-center text-sm"
                            >
                                {CONDITION_LABEL[condition]}
                            </FilterChip>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection index={4} title="Año" count={f.yearFrom !== null || f.yearTo !== null ? 1 : 0}>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {YEAR_PRESETS.map((year) => {
                                const active = f.yearFrom === year && f.yearTo === null

                                return (
                                <FilterChip
                                    key={year}
                                    active={active}
                                    onClick={() => setF({ yearFrom: active ? null : year, yearTo: null, page: 1 })}
                                >
                                    {year}+
                                </FilterChip>
                                )
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <NumberField
                                label="Desde"
                                value={f.yearFrom}
                                onCommit={(yearFrom) => setF({ yearFrom, page: 1 })}
                                placeholder="2010"
                                min={1900}
                                max={MAX_YEAR}
                            />
                            <NumberField
                                label="Hasta"
                                value={f.yearTo}
                                onCommit={(yearTo) => setF({ yearTo, page: 1 })}
                                placeholder={String(MAX_YEAR)}
                                min={1900}
                                max={MAX_YEAR}
                            />
                        </div>
                    </div>
                </FilterSection>

                <FilterSection index={5} title="Precio" count={f.minPrice !== null || f.maxPrice !== null ? 1 : 0}>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                        {CATALOG_CURRENCIES.map((code) => (
                            <FilterChip
                            key={code}
                            active={currency === code}
                            onClick={() => setF({ currency: code === "USD" ? null : code, page: 1 })}
                            className="h-7 px-2.5 font-mono"
                            >
                            {code}
                            </FilterChip>
                        ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                        <NumberField
                            label="Mínimo"
                            value={f.minPrice}
                            onCommit={(minPrice) => setF({ minPrice, page: 1 })}
                            placeholder="0"
                            prefix={currency}
                            min={0}
                            max={9_999_999_999}
                        />
                        <NumberField
                            label="Máximo"
                            value={f.maxPrice}
                            onCommit={(maxPrice) => setF({ maxPrice, page: 1 })}
                            placeholder="Sin tope"
                            prefix={currency}
                            min={0}
                            max={9_999_999_999}
                        />
                        </div>
                    </div>
                </FilterSection>

                <FilterSection index={6} title="Horas de uso" count={f.maxHours !== null ? 1 : 0}>
                    <NumberField
                        label="Máximo"
                        value={f.maxHours}
                        onCommit={(maxHours) => setF({ maxHours, page: 1 })}
                        placeholder="Sin tope"
                        suffix="h"
                        min={0}
                        max={200_000}
                    />
                </FilterSection>

                <FilterSection
                    index={7}
                    title="Potencia"
                    count={f.minHorsepower !== null || f.maxHorsepower !== null ? 1 : 0}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <NumberField
                            label="Mínima"
                            value={f.minHorsepower}
                            onCommit={(minHorsepower) => setF({ minHorsepower, page: 1 })}
                            placeholder="0"
                            suffix="HP"
                            min={1}
                            max={5_000}
                        />
                        <NumberField
                            label="Máxima"
                            value={f.maxHorsepower}
                            onCommit={(maxHorsepower) => setF({ maxHorsepower, page: 1 })}
                            placeholder="Sin tope"
                            suffix="HP"
                            min={1}
                            max={5_000}
                        />
                    </div>
                </FilterSection>
            </SidebarContent>

            {/* {(activeCount > 0 || isMobile) && (
                <SidebarFooter className="gap-2 border-t border-white/10 p-4 bg-teal-950">
                    {isMobile && (
                        <button
                        type="button"
                        onClick={() => setOpenMobile(false)}
                        className="h-11 w-full rounded-sm bg-lime-400 text-sm font-semibold text-teal-950 outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                        Ver resultados
                        </button>
                    )}

                    {activeCount > 0 && (
                        <button
                        type="button"
                        onClick={reset}
                        className="h-10 w-full rounded-sm border border-white/15 text-sm text-white/80 outline-none hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-lime-400/40"
                        >
                        Limpiar todo
                        </button>
                    )}
                </SidebarFooter>
            )} */}
        </Sidebar>
    )
}