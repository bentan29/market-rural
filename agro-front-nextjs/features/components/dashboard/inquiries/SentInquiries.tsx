import Link from "next/link"
import { redirect } from "next/navigation"
import { getSentInquiries } from "@/features/actions/private/inquiries/get-inquiries"
import { PaginationApp } from "../../global/pagination/Pagination-App"
import { formatDate } from "../listings/table/listing-format"
import { Notice } from "../overview/overview-ui"

const PATH = "/dashboard/consultas?tab=enviadas"

export async function SentInquiries({ page }: { page: number }) {
    const result = await getSentInquiries(page)

    if (!result.ok) {
        if (result.status === 401) redirect(`/login?next=${encodeURIComponent(PATH)}`)
        return <Notice tone="danger">{result.message}</Notice>
    }

    const { items, total, totalPages } = result.data

    if (total === 0) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed p-10 text-center">
                <p className="max-w-sm text-sm text-muted-foreground">
                    Todavía no le escribiste a ningún vendedor. Tus consultas quedan guardadas acá.
                </p>
                <Link
                    href="/catalogo"
                    className="inline-flex h-10 items-center rounded-sm border border-teal-900/25 px-5 text-sm font-semibold text-teal-950 hover:bg-teal-950/5"
                >
                    Explorar el catálogo
                </Link>
            </div>
        )
    }

    if (items.length === 0) redirect(`${PATH}&page=${totalPages}`)

    return (
        <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "consulta enviada" : "consultas enviadas"}
            </p>

            <ul className="space-y-3">
                {items.map((inquiry) => (
                    <li key={inquiry.id} className="space-y-2 rounded-sm border border-teal-900/15 bg-card p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-0.5">
                                {/* Si la publicación ya no se ve, se muestra el título sin enlace */}
                                {inquiry.listing.status === "PUBLISHED" ? (
                                    <Link
                                        href={`/maquinaria/${inquiry.listing.slug}`}
                                        className="text-sm font-semibold text-teal-950 underline-offset-4 hover:underline"
                                    >
                                        {inquiry.listing.title}
                                    </Link>
                                ) : (
                                    <p className="text-sm font-semibold text-teal-950">
                                        {inquiry.listing.title}{" "}
                                        <span className="text-xs font-normal text-muted-foreground">(ya no está disponible)</span>
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    a{" "}
                                    <Link
                                        href={`/agente/${inquiry.seller.slug}`}
                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                    >
                                        {inquiry.seller.displayName}
                                    </Link>
                                </p>
                            </div>

                            <time dateTime={inquiry.createdAt} className="shrink-0 text-xs text-muted-foreground">
                                {formatDate(inquiry.createdAt)}
                            </time>
                        </div>

                        <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-foreground/85">
                            {inquiry.message}
                        </p>
                    </li>
                ))}
            </ul>

            {totalPages > 1 && <PaginationApp totalPages={totalPages} />}
        </div>
    )
}