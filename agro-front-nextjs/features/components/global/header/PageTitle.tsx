import { cn } from "@/lib/utils"

type PageTitleProps = {
    title: string
    subtitle?: string
    /** Texto corto sobre el título (ej: "Catálogo") */
    eyebrow?: string
    align?: "left" | "center"
    as?: "h1" | "h2"
    className?: string
}

export const PageTitle = ({
    title,
    subtitle,
    eyebrow,
    align = "left",
    as: Heading = "h1",
    className,
}: PageTitleProps) => {
     const isCenter = align === "center"

  return (
    <header
      className={cn(
        "flex flex-col gap-2",
        isCenter && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          {eyebrow}
        </p>
      )}

      <Heading className="text-balance text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">
        {title}
      </Heading>

      <span aria-hidden className="h-1 w-12 bg-lime-400" />

      {subtitle && (
        <p className="max-w-2xl text-pretty text-base text-teal-900/70 sm:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  )
}
