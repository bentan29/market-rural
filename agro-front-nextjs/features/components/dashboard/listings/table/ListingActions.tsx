'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  MoreVerticalIcon,
  PencilEdit02Icon,
  StarIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"
import {
  featureListingAction,
  unfeatureListingAction,
} from "@/features/actions/private/listings/feature-listing.action"
import type { ListingType } from "@/lib/types/listing.type"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, getStatusTransitions } from "./inputs-labels"
import { changeListingStatusAction } from "./change-status.action"

type ActionResult = { ok: true } | { ok: false; status?: number; message: string }

//- Título de sección dentro del menú (tiene que ir dentro de un DropdownMenuGroup)
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuLabel className="px-2.5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </DropdownMenuLabel>
  )
}

//- Contenido de cada opción: ícono, qué hace, una línea que explica el efecto y, si corresponde, el resultado
function OptionContent({
  icon,
  title,
  description,
  note,
  trailing,
}: {
  icon?: IconSvgElement
  title: string
  description: string
  note?: string
  trailing?: React.ReactNode
}) {
  return (
    <div className="flex w-full items-start gap-3">
      {icon && (
        <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm  text-foreground ${title.includes('Quitar') ? 'bg-red-500' : 'bg-muted'} `}>
          <HugeiconsIcon icon={icon} size={16} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
        {note && <p className="mt-1 text-xs font-medium text-amber-700">{note}</p>}
      </div>

      {trailing}
    </div>
  )
}

const itemClass = "cursor-pointer items-start rounded-sm px-2.5 py-2"

export function ListingActions({ listing }: { listing: ListingType }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isPublished = listing.status === "PUBLISHED"
  const transitions = getStatusTransitions(listing.status, listing.operation)
  const current = STATUS_CONFIG[listing.status]

  //- Ejecuta una acción del servidor y se ocupa de los avisos y de la sesión vencida
  function run(task: () => Promise<ActionResult>, successMessage: string) {
    startTransition(async () => {
      try {
        const res = await task()

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?next=/dashboard/publicaciones")
            return
          }
          toast.add({ type: "error", description: res.message })
          return
        }

        toast.add({ type: "success", description: successMessage })
        router.refresh()
      } catch {
        toast.add({ type: "error", description: "Ocurrió un error inesperado" })
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Acciones de ${listing.title}`}
        disabled={isPending}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "shrink-0")}
      >
        <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-1">

        {/* Cabecera: de qué publicación hablamos y en qué estado está */}
        <div className="flex items-center justify-between gap-3 border-b px-2.5 py-2">
          <p className="min-w-0 truncate text-sm font-semibold">{listing.title}</p>
          <Badge className={cn("shrink-0 rounded-sm border-0 text-[10px] font-semibold", current.className)}>
            {current.label}
          </Badge>
        </div>

        {/* Publicación */}
        <DropdownMenuGroup>
          <SectionLabel>Publicación</SectionLabel>

          {isPublished && (
            <DropdownMenuItem render={<Link href={`/maquinaria/${listing.slug}`} />} className={itemClass}>
              <OptionContent
                icon={ViewIcon}
                title="Ver publicación"
                description="Mirá cómo la ven los compradores."
              />
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            render={<Link href={`/dashboard/publicaciones/${listing.id}/editar`} />}
            className={itemClass}
          >
            <OptionContent
              icon={PencilEdit02Icon}
              title="Editar"
              description="Cambiá el precio, la descripción y los datos de la máquina."
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Visibilidad: solo las publicadas se pueden destacar */}
        {isPublished && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SectionLabel>Visibilidad</SectionLabel>

              <DropdownMenuItem
                disabled={isPending}
                className={itemClass}
                onClick={() =>
                  run(
                    () =>
                      listing.featured
                        ? unfeatureListingAction(listing.id)
                        : featureListingAction(listing.id),
                    listing.featured ? "Quitaste el destacado" : "Publicación destacada",
                  )
                }
              >
                <OptionContent
                  icon={StarIcon}
                  title={listing.featured ? "Quitar destacado" : "Destacar"}
                  description={
                    listing.featured
                      ? "Libera un cupo para destacar otra publicación."
                      : "Aparece primero en el catálogo mientras dure tu plan."
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {/* Cambiar estado: cada opción dice qué pasa y en qué estado queda */}
        {transitions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SectionLabel>Cambiar estado</SectionLabel>

              {transitions.map((transition) => {
                const target = STATUS_CONFIG[transition.to]
                //- Al salir de PUBLISHED el backend quita el destacado: se avisa antes de hacerlo
                const losesFeatured = listing.featured && transition.to !== "PUBLISHED"

                return (
                  <DropdownMenuItem
                    key={transition.to}
                    disabled={isPending}
                    className={itemClass}
                    onClick={() =>
                      run(() => changeListingStatusAction(listing.id, transition.to), "Estado actualizado")
                    }
                  >
                    <OptionContent
                      title={transition.label}
                      description={transition.description}
                      note={losesFeatured ? "También se quita el destacado." : undefined}
                      trailing={
                        <Badge
                          className={cn(
                            "mt-0.5 shrink-0 rounded-sm border-0 text-[10px] font-semibold",
                            target.className,
                          )}
                        >
                          {target.label}
                        </Badge>
                      }
                    />
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}