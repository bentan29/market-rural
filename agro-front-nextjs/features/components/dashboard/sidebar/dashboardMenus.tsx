"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "../constants/options-sidebar-dashboard"

type NavMainProps = {
  label: string
  items: NavItem[]
}

//- Este es el que usa usePathname: por eso necesita estar dentro de un Suspense
function DashboardMenuContent({ label, items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.items?.length ? (
              <Collapsible
                defaultOpen={item.items.some((sub) => sub.url === pathname)}
                className="group/collapsible"
              >
                <CollapsibleTrigger
                  render={<SidebarMenuButton tooltip={item.title} />}
                >
                  {item.icon && <HugeiconsIcon icon={item.icon} />}
                  <span>{item.title}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-auto transition-transform duration-200 group-data-panel-open/menu-button:rotate-90"
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.url}
                          render={<Link href={subItem.url} />}
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuButton
                tooltip={item.title}
                isActive={pathname === item.url}
                render={<Link href={item.url} />}
              >
                {item.icon && <HugeiconsIcon icon={item.icon} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

//- Mientras llega el pathname se reserva el espacio, para que el menú no salte
function DashboardMenuSkeleton({ rows }: { rows: number }) {
  return (
    <SidebarGroup>
      <div className="mb-2 h-4 w-24 animate-pulse rounded-sm bg-sidebar-accent" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-8 w-full animate-pulse rounded-sm bg-sidebar-accent" />
        ))}
      </div>
    </SidebarGroup>
  )
}

//- Es el que se importa en el resto de la app: ya trae su Suspense
export function DashboardMenu(props: NavMainProps) {
  return (
    <Suspense fallback={<DashboardMenuSkeleton rows={Math.max(props.items.length, 2)} />}>
      <DashboardMenuContent {...props} />
    </Suspense>
  )
}