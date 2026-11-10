'use client'

import Link from "next/link"
import { Globe02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DashboardMenu } from "./dashboardMenus"
import { SellerCta } from "./SellerCta"
import { data } from "../constants/options-sidebar-dashboard"
import { useAuth } from "@/features/providers/AuthProvider"

export function DashboardSidebar() {

  const { user, status } = useAuth()

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarContent>
        <DashboardMenu label="Configuración" items={data.userMenus} />

        {/* Según el rol: vendedor ve su menú, usuario común ve la invitación */}
        {status === 'loading' ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <div className="h-40 rounded-sm bg-sidebar-accent" />
          </SidebarGroup>
        ) : user?.role === 'SELLER' ? (
          <DashboardMenu label="Agente" items={data.sellerMenus} />
        ) : user?.role === 'USER' ? (
          <SellerCta />
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Volver al sitio"
              render={<Link href="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-brand text-white">
                <HugeiconsIcon icon={Globe02Icon} size={18} />
              </div>
              <div className="grid text-left leading-tight">
                <span className="font-semibold">MarketRural</span>
                <span className="text-xs text-sidebar-foreground/60">Ir al sitio</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}