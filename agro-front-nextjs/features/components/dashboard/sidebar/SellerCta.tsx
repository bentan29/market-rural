'use client'

import Link from "next/link"
import { ArrowRight01Icon, Tick02Icon, TractorIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

//- Ajustá la ruta a la página donde se completa el perfil de vendedor
const SELLER_HREF = "/dashboard/registro-vendedor"

const BENEFITS = [
  "Publicá en venta o alquiler",
  "Llegá a compradores de toda la región",
  "Gestioná todo desde tu panel",
]

export function SellerCta() {
  return (
    <>
      {/* Sidebar expandido: tarjeta completa */}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="rounded-sm bg-brand p-4 text-white shadow-sm">
          <span className="block border-l-2 border-white/60 pl-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
            Para vendedores
          </span>

          <h3 className="mt-3 text-balance text-lg font-bold leading-tight">
            Vendé o alquilá tu maquinaria
          </h3>

          <ul className="mt-3 space-y-1.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-xs text-white/85">
                <HugeiconsIcon icon={Tick02Icon} size={14} className="mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <Link
            href={SELLER_HREF}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-sm bg-white px-3 py-2 text-sm font-semibold text-teal-950 transition-colors hover:bg-white/90"
          >
            Registrarme como vendedor
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </Link>
        </div>
      </SidebarGroup>

      {/* Sidebar colapsado: solo el ícono, con tooltip */}
      <SidebarGroup className="hidden group-data-[collapsible=icon]:flex">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Registrarme como vendedor"
              render={<Link href={SELLER_HREF} />}
              className="bg-brand text-white hover:bg-brand-hover hover:text-white"
            >
              <HugeiconsIcon icon={TractorIcon} />
              <span>Registrarme como vendedor</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}