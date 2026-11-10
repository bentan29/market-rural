import { Suspense } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth/get-user"
import type { SessionUser } from "@/lib/types/auth.type"

type Tone = "hero" | "banner"

type Cta = {
  href: string
  label: string
  hint: string
  login?: { href: string; label: string }
}

//- Los tres casos: sin sesión, USER y SELLER (el ADMIN va a su panel)
function resolveCta(user: SessionUser | null): Cta {
  if (!user) {
    return {
      href: "/registrarme",
      label: "Crear mi cuenta",
      hint: "¿Ya tenés cuenta?",
      login: { href: "/iniciar-sesion?next=/vender", label: "Ingresá" },
    }
  }

  if (user.role === "SELLER") {
    return {
      href: "/dashboard/publicaciones/crear",
      label: "Publicar mi maquinaria",
      hint: "Ya sos vendedor. Podés publicar cuando quieras.",
    }
  }

  if (user.role === "USER") {
    return {
      href: "/dashboard/registro-usuario",
      label: "Crear mi perfil de vendedor",
      hint: "Ya tenés cuenta: solo te falta completar tus datos de vendedor.",
    }
  }

  return { href: "/dashboard", label: "Ir a mi panel", hint: "" }
}

async function SellCtaContent({ tone }: { tone: Tone }) {
  const user = await getCurrentUser()
  const cta = resolveCta(user)

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={cta.href}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-fit rounded-sm px-6",
          tone === "hero"
            ? "bg-brand text-brand-foreground hover:bg-brand-hover"
            : "bg-white text-teal-950 hover:bg-white/90"
        )}
      >
        {cta.label}
      </Link>

      {cta.hint && (
        <p className="text-sm text-white/70">
          {cta.hint}{" "}
          {cta.login && (
            <Link
              href={cta.login.href}
              className="font-medium text-lime-400 underline underline-offset-4 hover:text-lime-300"
            >
              {cta.login.label}
            </Link>
          )}
        </p>
      )}
    </div>
  )
}

//- Mientras se confirma la sesión se reserva el espacio del botón
export function SellCta({ tone = "hero" }: { tone?: Tone }) {
    return (
        <Suspense
            fallback={<div className={cn("h-11 w-56 rounded-sm", tone === "hero" ? "bg-white/15" : "bg-white/30")} />}
        >
            <SellCtaContent tone={tone} />
        </Suspense>
    )
}