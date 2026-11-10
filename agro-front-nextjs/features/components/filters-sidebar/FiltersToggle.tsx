"use client"

import { FilterHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useSidebar } from "@/components/ui/sidebar"

export function FiltersToggle() {
  
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar()
  const isOpen = isMobile ? openMobile : open

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-expanded={isOpen}
      className="inline-flex h-9 items-center gap-2 rounded-sm border border-teal-950/20 bg-background px-3 text-sm font-medium outline-none hover:border-teal-950/50 focus-visible:ring-2 focus-visible:ring-lime-500/40"
    >
      <HugeiconsIcon icon={FilterHorizontalIcon} size={16} />
      {isOpen ? "Ocultar filtros" : "Mostrar filtros"}
    </button>
  )
}