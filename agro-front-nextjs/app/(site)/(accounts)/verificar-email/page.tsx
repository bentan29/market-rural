import type { Metadata } from "next"
import { Suspense } from "react"
import { VerifyEmailCard } from "@/features/components/auth/verification/VerifyEmailCard"

export const metadata: Metadata = {
    title: "Confirmar email",
    robots: { index: false, follow: false },
    //- El token va en la URL: que no viaje en el encabezado Referer a ningún otro sitio
    referrer: "no-referrer",
}

type Props = {
    searchParams: Promise<{ token?: string | string[] }>
}

//- Lee la URL: por eso va dentro de un Suspense
async function Content({ searchParams }: Props) {
    const { token } = await searchParams
    return <VerifyEmailCard token={typeof token === "string" ? token : null} />
}

export default function VerificarEmailPage(props: Props) {
    return (
        <div className="flex min-h-[calc(100svh-var(--header-height))] items-center justify-center bg-teal-950 p-6">
            <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-sm bg-white/10" />}>
                <Content {...props} />
            </Suspense>
        </div>
    )
}