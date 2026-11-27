import Link from "next/link"
import { redirect } from "next/navigation"
import { getReceivedInquiries } from "@/features/actions/private/inquiries/get-inquiries"
import { PaginationApp } from "../../global/pagination/Pagination-App"
import { formatDate } from "../listings/table/listing-format"
import { Notice } from "../overview/overview-ui"
import { MarkReadButton } from "./MarkReadButton"

const PATH = "/dashboard/consultas?tab=recibidas"

export async function ReceivedInquiries({ page }: { page: number }) {
    const result = await getReceivedInquiries(page)

    if (!result.ok) {
        if (result.status === 401) redirect(`/login?next=${encodeURIComponent(PATH)}`)
        return <Notice tone="danger">{result.message}</Notice>
    }

    const { items, total, totalPages, unread } = result.data

    if (total === 0) {
        return (
            <p className="rounded-sm border border-dashed p-10 text-center text-sm text-muted-foreground">
                Todavía no recibiste consultas. Cuando alguien te escriba desde una publicación, aparece acá.
            </p>
        )
    }

    //- Una página fuera de rango vuelve a la última que existe
    if (items.length === 0) redirect(`${PATH}&page=${totalPages}`)

    return (
        <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "consulta" : "consultas"}
                {unread > 0 && <span className="font-semibold text-teal-950"> · {unread} sin leer</span>}
            </p>

            <ul className="space-y-3">
                {items.map((inquiry) => (
                    <li key={inquiry.id} className="space-y-3 rounded-sm border border-teal-900/15 bg-card p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-0.5">
                                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-teal-950">
                                    {inquiry.name}
                                    {!inquiry.readAt && (
                                        <span className="rounded-xs bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-foreground">
                                            Nueva
                                        </span>
                                    )}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    por{" "}
                                    <Link
                                        href={`/maquinaria/${inquiry.listing.slug}`}
                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                    >
                                        {inquiry.listing.title}
                                    </Link>
                                </p>
                            </div>

                            <time dateTime={inquiry.createdAt} className="shrink-0 text-xs text-muted-foreground">
                                {formatDate(inquiry.createdAt)}
                            </time>
                        </div>

                        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/85">{inquiry.message}</p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-teal-900/10 pt-3 text-sm">
                            <a
                                href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.listing.title}`)}`}
                                className="font-semibold text-teal-900 underline-offset-4 hover:underline"
                            >
                                Responder por email
                            </a>

                            {inquiry.phone && (
                                <a
                                    href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}
                                    className="font-semibold text-teal-900 underline-offset-4 hover:underline"
                                >
                                    Llamar ({inquiry.phone})
                                </a>
                            )}

                            {!inquiry.readAt && <MarkReadButton id={inquiry.id} />}
                        </div>
                    </li>
                ))}
            </ul>

            {totalPages > 1 && <PaginationApp totalPages={totalPages} />}
        </div>
    )
}