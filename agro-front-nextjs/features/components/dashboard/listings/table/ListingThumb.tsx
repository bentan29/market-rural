"use client"

import Image from "next/image"
import { TractorIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cloudinaryCardLoader } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

type Props = {
    publicId: string | null
    className?: string
}

//- Es de cliente porque `loader` es una función, y una función no puede viajar de un componente de servidor a uno de cliente
export function ListingThumb({ publicId, className }: Props) {
    return (
        <div className={cn("relative shrink-0 overflow-hidden rounded-sm bg-stone-100", className)}>
            {publicId ? (
                <Image
                    loader={cloudinaryCardLoader}
                    src={publicId}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                />
            ) : (
                <div className="grid size-full place-items-center text-stone-300">
                    <HugeiconsIcon icon={TractorIcon} size={22} strokeWidth={1.4} />
                </div>
            )}
        </div>
    )
}