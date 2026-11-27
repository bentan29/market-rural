import Link from "next/link"
import { cn } from "@/lib/utils"

export type InquiryTab = "recibidas" | "enviadas"

const TABS: { key: InquiryTab; label: string }[] = [
    { key: "recibidas", label: "Recibidas" },
    { key: "enviadas", label: "Enviadas" },
]

//- Enlaces simples (sin estado de cliente): cada pestaña es una URL
export function InquiriesTabs({ active }: { active: InquiryTab }) {
    return (
        <nav aria-label="Tipo de consultas" className="flex gap-1 border-b border-teal-900/15">
            {TABS.map((tab) => (
                <Link
                    key={tab.key}
                    href={`/dashboard/consultas?tab=${tab.key}`}
                    aria-current={active === tab.key ? "page" : undefined}
                    className={cn(
                        "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold outline-none focus-visible:bg-muted",
                        active === tab.key
                            ? "border-brand text-teal-950"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    )
}