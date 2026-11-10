import type { Metadata } from "next"
import Image from "next/image"
import {
  AccountSetting02Icon,
  Globe02Icon,
  SendIcon,
  ShoppingBasket02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SellCta } from "@/features/components/seller/landing/SellCta"

export const metadata: Metadata = {
  title: "Vendé o alquilá tu maquinaria rural | MarketRural",
  description:
    "Publicá tractores, cosechadoras y equipos agrícolas y llegá a compradores de Uruguay, Argentina y Perú.",
}

const STEPS = [
  {
    title: "Creá tu cuenta",
    text: "Registrate con tu nombre, email y contraseña.",
  },
  {
    title: "Completá tu perfil de vendedor",
    text: "Sumá tu nombre comercial, teléfono y ubicación para que los compradores puedan contactarte.",
  },
  {
    title: "Publicá tu maquinaria",
    text: "Cargá los datos de la máquina, elegí si es venta o alquiler y listo.",
  },
]

const BENEFITS = [
  {
    icon: ShoppingBasket02Icon,
    title: "Venta y alquiler",
    text: "Publicá tu máquina para vender, o para alquilar por día, semana o mes.",
  },
  {
    icon: Globe02Icon,
    title: "Alcance regional",
    text: "Tus avisos llegan a compradores de Uruguay, Argentina y Perú.",
  },
  {
    icon: SendIcon,
    title: "Contacto directo",
    text: "Te escriben o te llaman: tu teléfono y WhatsApp aparecen en tus publicaciones.",
  },
  {
    icon: AccountSetting02Icon,
    title: "Todo en tu panel",
    text: "Administrá tus publicaciones y tu perfil desde un solo lugar.",
  },
]

export default function VenderPage() {
  return (
    <>
      {/* 1. Hero: mismo lenguaje que el de la home, sin animación */}
      <section className="relative min-h-[min(500px,calc(100svh-64px))] w-full overflow-hidden bg-teal-900">
        <Image
          src="/images/banner/vender3.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            pointer-events-none
            object-cover object-[65%_center]
            opacity-60
            mask-[linear-gradient(to_right,transparent_10%,black_70%)]
            md:opacity-100
          "
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/50 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-7xl flex-col justify-center gap-6 px-6 py-16 text-white md:px-16">
          <span className="w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            MarketRural · <span className="rounded-xs bg-brand px-2 py-0.5 text-white">Para vendedores</span>
          </span>

          <h1 className="max-w-2xl text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Vendé o alquilá tu maquinaria{" "}
            <span className="text-lime-400">a toda la región.</span>
          </h1>

          <p className="max-w-xl text-lg text-white/75 md:text-xl">
            Publicá tractores, cosechadoras y equipos agrícolas. Creá tu perfil una vez y
            gestioná todas tus publicaciones desde tu panel.
          </p>

          <SellCta tone="hero" />
        </div>
      </section>

      {/* 2. Cómo funciona */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16 md:px-16">
        <span className="border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Cómo funciona
        </span>
        <h2 className="mt-4 max-w-xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
          Tres pasos para empezar a vender
        </h2>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-sm border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-sm bg-brand text-sm font-bold text-brand-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Beneficios */}
      <section className="bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-16">
          <span className="border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Por qué MarketRural
          </span>
          <h2 className="mt-4 max-w-xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Pensado para quien trabaja con maquinaria
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-sm border bg-background p-6">
                <div className="flex size-10 items-center justify-center rounded-sm bg-teal-950 text-lime-400">
                  <HugeiconsIcon icon={b.icon} size={20} />
                </div>
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Cierre */}
      <section className="bg-teal-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-16 text-white md:px-16">
          <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
            ¿Listo para publicar{" "}
            <span className="text-lime-400">tu primera máquina?</span>
          </h2>
          <SellCta tone="banner" />
        </div>
      </section>
    </>
  )
}