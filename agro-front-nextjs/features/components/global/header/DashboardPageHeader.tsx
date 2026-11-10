import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type DashboardPageHeaderProps = {
  title: string
  subtitle?: string
  as?: "h1" | "h2"
  className?: string
}


export const DashboardPageHeader = ({
    title,
    subtitle,
    as: Heading = "h1",
    className,
}: DashboardPageHeaderProps) => {
    return (
        <header
            className={cn(
                "flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-end sm:justify-between",
                className,
            )}
            >
            <div className="min-w-0 space-y-1">
                <Heading className="truncate text-xl font-semibold tracking-tight text-teal-950 sm:text-2xl">
                    {title}
                </Heading>

                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
            </div>
        </header>
    )
}
