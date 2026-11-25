"use client"

import { useState } from "react"
import Image from "next/image"
import { TractorIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cloudinaryCardLoader, cloudinaryLoader } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

type Props = {
    images: { publicId: string; width: number; height: number }[]
    title: string
}

export function ListingGallery({ images, title }: Props) {
    const [active, setActive] = useState(0)

    if (images.length === 0) {
        return (
            <div className="grid aspect-4/3 place-items-center rounded-sm bg-stone-100 text-stone-300">
                <HugeiconsIcon icon={TractorIcon} size={72} strokeWidth={1.2} />
            </div>
        )
    }

    const current = images[Math.min(active, images.length - 1)]

    return (
        <div className="space-y-3">
            <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-stone-100">
                <Image
                    key={current.publicId}
                    loader={cloudinaryLoader}
                    src={current.publicId}
                    alt={`${title} (foto ${active + 1} de ${images.length})`}
                    fill
                    //- La primera foto es lo más importante de la página: se carga con prioridad
                    priority={active === 0}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-contain"
                />
            </div>

            {images.length > 1 && (
                <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                    {images.map((image, i) => (
                        <li key={image.publicId}>
                            <button
                                type="button"
                                onClick={() => setActive(i)}
                                aria-label={`Ver foto ${i + 1}`}
                                aria-current={i === active}
                                className={cn(
                                    "relative block aspect-4/3 w-full overflow-hidden rounded-sm border-2 bg-stone-100 outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                                    i === active ? "border-brand" : "border-transparent hover:border-stone-300",
                                )}
                            >
                                <Image loader={cloudinaryCardLoader} src={image.publicId} alt="" fill sizes="120px" className="object-cover" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}