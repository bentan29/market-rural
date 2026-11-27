import { cn } from "@/lib/utils"

//- Clases de los enlaces con forma de botón
export const primaryLink =
    "inline-flex h-10 items-center justify-center rounded-sm bg-brand px-5 text-sm font-semibold text-brand-foreground outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand/40"
export const secondaryLink =
    "inline-flex h-10 items-center justify-center rounded-sm border border-teal-900/25 px-5 text-sm font-semibold text-teal-950 outline-none hover:bg-teal-950/5 focus-visible:ring-2 focus-visible:ring-brand/40"

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.2em]"

export function OverviewPanel({
    title,
    action,
    children,
    className,
}: {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    return (
        <section className={cn("rounded-sm border border-teal-900/15 bg-card", className)}>
            <header className="flex items-center justify-between gap-3 border-b border-teal-900/10 px-5 py-3">
                <h2 className={cn(eyebrow, "text-teal-950")}>{title}</h2>
                {action}
            </header>
            <div className="p-5">{children}</div>
        </section>
    )
}

export function StatCard({
    label,
    value,
    unit,
    hint,
    progress,
}: {
    label: string
    value: React.ReactNode
    unit?: string
    hint?: React.ReactNode
    progress?: { value: number; max: number }
}) {
    const pct = progress && progress.max > 0 ? Math.min(100, Math.round((progress.value / progress.max) * 100)) : 0

    return (
        <div className="flex flex-col gap-3 rounded-sm border border-teal-900/15 bg-card p-5">
            <p className={cn(eyebrow, "text-muted-foreground")}>{label}</p>

            <p className="text-3xl leading-none font-bold tracking-tight text-teal-950 tabular-nums">
                {value}
                {unit && <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>}
            </p>

            {progress && (
                <div
                    role="progressbar"
                    aria-label={label}
                    aria-valuemin={0}
                    aria-valuemax={progress.max}
                    aria-valuenow={progress.value}
                    className="h-1.5 overflow-hidden rounded-xs bg-teal-950/10"
                >
                    <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
            )}

            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

const NOTICE_TONES = {
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-amber-500/40 bg-amber-50 text-amber-900",
} as const

export function Notice({
    tone,
    children,
}: {
    tone: keyof typeof NOTICE_TONES
    children: React.ReactNode
}) {
    return (
        <div role="alert" className={cn("rounded-sm border p-4 text-sm", NOTICE_TONES[tone])}>
            {children}
        </div>
    )
}

export function OverviewSkeleton() {
    return (
        <div className="flex flex-col gap-8" aria-busy="true">
            <div className="h-14 w-72 animate-pulse rounded-sm bg-muted" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-sm bg-muted" />
                ))}
            </div>
            <div className="h-64 animate-pulse rounded-sm bg-muted" />
        </div>
    )
}