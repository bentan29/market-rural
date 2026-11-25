"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Add02Icon, Cancel01Icon, LoaderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cloudinaryCardLoader } from "@/lib/cloudinary"

import { cn } from "@/lib/utils"
import { ACCEPTED_IMAGE_TYPES, MAX_LISTING_IMAGES, runPool, UploadedImage, uploadListingImage } from "@/features/actions/private/images/upload-image"

type ExistingImage = { id: string; publicId: string }

type LocalItem = {
    key: string
    previewUrl: string
    status: "uploading" | "done" | "error"
    message?: string
    uploaded?: UploadedImage
}

//- Lo que el formulario necesita saber: qué se subió, qué se quita y si todavía hay subidas en curso
export type ImagesChange = {
    uploaded: UploadedImage[]
    removeIds: string[]
    uploading: boolean
}

type Props = {
    existing?: ExistingImage[]
    onChange: (change: ImagesChange) => void
}

const badge = "absolute left-2 top-2 rounded-xs bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-foreground"
const actionLink = "text-xs font-medium underline-offset-4 hover:underline focus-visible:underline outline-none"

export function ListingImagesField({ existing = [], onChange }: Props) {
    const [items, setItems] = useState<LocalItem[]>([])
    const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set())
    const [notice, setNotice] = useState<string | null>(null)

    //- onChange por ref: si el padre pasa una función nueva en cada render, no se genera un bucle
    const onChangeRef = useRef(onChange)
    useEffect(() => {
        onChangeRef.current = onChange
    })

    useEffect(() => {
        onChangeRef.current({
            uploaded: items.flatMap((item) => (item.status === "done" && item.uploaded ? [item.uploaded] : [])),
            removeIds: [...removed],
            uploading: items.some((item) => item.status === "uploading"),
        })
    }, [items, removed])

    //- Las vistas previas locales se liberan al salir
    const urlsRef = useRef<string[]>([])
    useEffect(() => {
        const urls = urlsRef.current
        return () => urls.forEach((url) => URL.revokeObjectURL(url))
    }, [])

    const keptExisting = existing.filter((image) => !removed.has(image.id)).length
    const total = keptExisting + items.filter((item) => item.status !== "error").length
    const remainingSlots = MAX_LISTING_IMAGES - total

    //- La portada es la primera foto que se conserva
    const coverId = existing.find((image) => !removed.has(image.id))?.id ?? items[0]?.key

    async function handleFiles(fileList: FileList | null) {
        if (!fileList || fileList.length === 0) return

        const files = Array.from(fileList)
        const accepted = files.slice(0, Math.max(0, remainingSlots))

        setNotice(
            files.length > accepted.length
                ? `Solo entran ${MAX_LISTING_IMAGES} fotos por publicación (se agregaron ${accepted.length}).`
                : null,
        )
        if (accepted.length === 0) return

        const added = accepted.map((file) => {
            const previewUrl = URL.createObjectURL(file)
            urlsRef.current.push(previewUrl)
            return { file, item: { key: crypto.randomUUID(), previewUrl, status: "uploading" } as LocalItem }
        })

        setItems((prev) => [...prev, ...added.map(({ item }) => item)])

        await runPool(added, 3, async ({ file, item }) => {
            try {
                const uploaded = await uploadListingImage(file)
                setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, status: "done", uploaded } : i)))
            } catch (error) {
                const message = error instanceof Error ? error.message : "No pudimos subir la foto"
                setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, status: "error", message } : i)))
            }
        })
    }

    //- Una foto que se subió pero se descarta acá queda "sin usar" en Cloudinary: la limpieza diaria la borra
    function removeLocal(key: string) {
        setItems((prev) => {
            const target = prev.find((item) => item.key === key)
            if (target) URL.revokeObjectURL(target.previewUrl)
            return prev.filter((item) => item.key !== key)
        })
    }

    function toggleRemoved(id: string) {
        setRemoved((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
                {total} de {MAX_LISTING_IMAGES} fotos
            </p>

            {notice && <p className="text-xs text-amber-700">{notice}</p>}

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                {/* Fotos que ya tiene la publicación */}
                {existing.map((image) => {
                    const isRemoved = removed.has(image.id)

                    return (
                        <li key={image.id} className="space-y-1.5">
                            <div className={cn("relative aspect-4/3 overflow-hidden rounded-sm border bg-muted", isRemoved && "opacity-50")}>
                                <Image
                                    loader={cloudinaryCardLoader}
                                    src={image.publicId}
                                    alt=""
                                    fill
                                    sizes="(min-width: 768px) 25vw, 50vw"
                                    className="object-cover"
                                />
                                {coverId === image.id && <span className={badge}>Portada</span>}
                                {isRemoved && (
                                    <span className="absolute inset-0 grid place-items-center bg-background/70 px-2 text-center text-xs font-medium">
                                        Se quita al guardar
                                    </span>
                                )}
                            </div>

                            <button type="button" onClick={() => toggleRemoved(image.id)} className={actionLink}>
                                {isRemoved ? "Restaurar" : "Quitar"}
                            </button>
                        </li>
                    )
                })}

                {/* Fotos nuevas, todavía no guardadas en la publicación */}
                {items.map((item) => (
                    <li key={item.key} className="space-y-1.5">
                        <div className="relative aspect-4/3 overflow-hidden rounded-sm border bg-muted">
                            {/* blob: no se puede optimizar, por eso unoptimized */}
                            <Image
                                unoptimized
                                src={item.previewUrl}
                                alt=""
                                fill
                                className={cn("object-cover", item.status !== "done" && "opacity-60")}
                            />

                            {coverId === item.key && <span className={badge}>Portada</span>}

                            {item.status === "uploading" && (
                                <span className="absolute inset-0 grid place-items-center bg-background/40" role="status">
                                    <HugeiconsIcon icon={LoaderIcon} size={22} className="animate-spin" />
                                    <span className="sr-only">Subiendo foto</span>
                                </span>
                            )}

                            {item.status === "error" && (
                                <span role="alert" className="absolute inset-0 grid place-items-center bg-destructive/80 px-2 text-center text-xs font-medium text-white">
                                    {item.message}
                                </span>
                            )}
                        </div>

                        <button type="button" onClick={() => removeLocal(item.key)} className={cn(actionLink, "inline-flex items-center gap-1")}>
                            <HugeiconsIcon icon={Cancel01Icon} size={12} />
                            Quitar
                        </button>
                    </li>
                ))}

                {/* Agregar */}
                {remainingSlots > 0 && (
                    <li>
                        <label className="grid aspect-4/3 cursor-pointer place-items-center rounded-sm border-2 border-dashed text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground focus-within:ring-2 focus-within:ring-brand/50">
                            <span className="flex flex-col items-center gap-1">
                                <HugeiconsIcon icon={Add02Icon} size={22} />
                                Agregar fotos
                            </span>
                            <input
                                type="file"
                                multiple
                                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                className="sr-only"
                                onChange={(e) => {
                                    //- handleFiles copia la lista antes de su primer await: recién después se vacía el campo
                                    handleFiles(e.target.files)
                                    e.target.value = ""
                                }}
                            />
                        </label>
                    </li>
                )}
            </ul>
        </div>
    )
}