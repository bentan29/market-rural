import Image from "next/image"
import { CATALOG_COUNTRIES } from "@/features/constants/catalog/countries"

import type { PublicSeller } from "@/lib/types/seller.type"
import { telUrl, whatsappUrl } from "@/features/helpers/contact-phone"

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?"

const buttonBase =
  "inline-flex h-10 items-center rounded-sm px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"

export function AgentHeader({ seller }: { seller: PublicSeller }) {
  const country = CATALOG_COUNTRIES.find((c) => c.code === seller.country)

  const wa = seller.whatsapp
    ? whatsappUrl(seller.whatsapp, seller.country, `Hola ${seller.displayName}, vi tus publicaciones en MarketRural.`)
    : null
  const tel = telUrl(seller.phone, seller.country)

  const since = new Intl.DateTimeFormat("es-UY", { month: "long", year: "numeric" }).format(
    new Date(seller.createdAt),
  )

  return (
    <header className="rounded-xs bg-teal-950 p-6 text-white md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">

        <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-brand md:size-24">
          {seller.avatarUrl ? (
            <Image src={seller.avatarUrl} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-2xl font-bold text-brand-foreground">
              {initials(seller.displayName)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <span className="block w-fit border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              Agente
            </span>
            <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
              {seller.displayName}
            </h1>
            <p className="text-sm text-white/70">
              {seller.location}
              {country ? `, ${country.name}` : ""}
            </p>
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-white/50">Publicaciones</dt>
              <dd className="font-mono tabular-nums">{seller.listingsCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-white/50">En MarketRural desde</dt>
              <dd className="capitalize">{since}</dd>
            </div>
          </dl>

          {seller.about && (
            <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/80">{seller.about}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonBase} bg-brand text-brand-foreground hover:bg-brand-hover`}
              >
                Escribir por WhatsApp
              </a>
            )}
            {tel && (
              <a href={tel} className={`${buttonBase} border border-white/30 bg-white/10 hover:bg-white/20`}>
                Llamar
              </a>
            )}
            {seller.website && (
              <a
                href={seller.website}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className={`${buttonBase} border border-white/30 bg-white/10 hover:bg-white/20`}
              >
                Sitio web
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}