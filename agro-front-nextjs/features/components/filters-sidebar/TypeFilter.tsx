"use client"

import { useMemo, useState } from "react"
import { ArrowDown01Icon, Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { MACHINE_GROUPS, type MachineItem } from "@/features/constants/products/type-machine.constant"
import { cn } from "@/lib/utils"
import { FilterChip, toggle } from "./Filter-atoms"

type MachineGroup = {
  readonly label: string
  readonly items: readonly MachineItem[]
}

//- Una sola lista con tipo común: evita la unión de tuplas que rompía flatMap/filter
const GROUPS: readonly MachineGroup[] = MACHINE_GROUPS

const LABEL_BY_VALUE = new Map<string, string>(
  GROUPS.flatMap((group) => group.items).map((item) => [item.value, item.label]),
)

//- "pulverizadora" encuentra "Pulverizadora", ignorando mayúsculas y tildes
const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

export function TypeFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (value: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const q = normalize(query.trim())

  const visibleGroups = useMemo(
    () =>
      GROUPS.map((group) => ({
        label: group.label,
        items: q ? group.items.filter((item) => normalize(item.label).includes(q)) : group.items,
      })).filter((group) => group.items.length > 0),
    [q],
  )

  return (
    <div className="space-y-4">
      {/* Seleccionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <FilterChip key={value} active onClick={() => onChange(toggle(selected, value))}>
              {LABEL_BY_VALUE.get(value) ?? value}
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
            </FilterChip>
          ))}
        </div>
      )}

      {/* Buscador */}
      <label className="relative block">
        <HugeiconsIcon
          icon={Search01Icon}
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar máquina..."
          aria-label="Buscar tipo de máquina"
          className="h-10 w-full rounded-sm border border-white/15 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
        />
      </label>

      {/* Categorías */}
      <div className="divide-y divide-white/10 border-y border-white/10">
        {visibleGroups.map(({ label, items }) => {
          const isOpen = q !== "" || openGroups.includes(label)
          const count = items.filter((item) => selected.includes(item.value)).length

          return (
            <div key={label}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenGroups((prev) =>
                    prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
                  )
                }
                className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-[13px] text-white/85 outline-none hover:text-white focus-visible:text-lime-300"
              >
                <span className="flex items-center gap-2">
                  {label}
                  {count > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-xs bg-lime-400 px-1 text-[10px] font-bold text-teal-950">
                      {count}
                    </span>
                  )}
                </span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  className={cn("shrink-0 text-white/40", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && (
                <div className="flex flex-wrap gap-1.5 pb-3">
                  {items.map((item) => (
                    <FilterChip
                      key={item.value}
                      active={selected.includes(item.value)}
                      onClick={() => onChange(toggle(selected, item.value))}
                    >
                      {item.label}
                    </FilterChip>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {visibleGroups.length === 0 && (
          <p className="py-4 text-center text-sm text-white/50">Sin resultados para «{query}»</p>
        )}
      </div>
    </div>
  )
}