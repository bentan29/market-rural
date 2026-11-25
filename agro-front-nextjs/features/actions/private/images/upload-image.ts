import { apiFetch } from "@/lib/api"

export const MAX_LISTING_IMAGES = 10 // el mismo que en el backend
const MAX_SIDE = 2000
const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024
//- Con estos tipos explícitos, iOS convierte las fotos HEIC a JPEG al elegirlas
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export type UploadedImage = {
    publicId: string
    version: number
    signature: string
    width: number
    height: number
}

//- Achica la foto a MAX_SIDE y la recomprime: una de 8 MB pasa a ~0,5 MB antes de salir del navegador
async function prepareImage(file: File): Promise<Blob> {
    //- from-image aplica la rotación de la cámara (si no, las fotos del celular salen de costado)
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })

    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No pudimos procesar la foto")

    ctx.fillStyle = "#ffffff" // un PNG con transparencia no puede quedar negro
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    //- JPEG a propósito: Safari no siempre codifica WebP desde un canvas
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    if (!blob) throw new Error("No pudimos procesar la foto")

    return blob
}

//- Sube una foto: pide la firma a Nest y manda el archivo directo a Cloudinary
export async function uploadListingImage(file: File): Promise<UploadedImage> {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error("Usá fotos JPG, PNG o WebP")
    if (file.size > MAX_ORIGINAL_BYTES) throw new Error("La foto pesa demasiado (máximo 30 MB)")

    const [blob, signResponse] = await Promise.all([
        prepareImage(file),
        apiFetch("/listings/images/signature", { method: "POST" }),
    ])

    if (!signResponse.ok) {
        throw new Error(
            signResponse.status === 403 ? "Necesitás ser vendedor para subir fotos" : "No pudimos preparar la subida",
        )
    }

    const sign = (await signResponse.json()) as {
        cloudName: string
        apiKey: string
        timestamp: number
        folder: string
        tags: string
        allowed_formats: string
        transformation: string
        signature: string
    }

    //- Tienen que viajar EXACTAMENTE los mismos parámetros que Nest firmó
    const form = new FormData()
    form.append("file", blob)
    form.append("api_key", sign.apiKey)
    form.append("timestamp", String(sign.timestamp))
    form.append("signature", sign.signature)
    form.append("folder", sign.folder)
    form.append("tags", sign.tags)
    form.append("allowed_formats", sign.allowed_formats)
    form.append("transformation", sign.transformation)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
        method: "POST",
        body: form,
    })
    const body = await res.json().catch(() => null)

    if (!res.ok || !body?.public_id) throw new Error(body?.error?.message ?? "No pudimos subir la foto")

    return {
        publicId: body.public_id,
        version: body.version,
        signature: body.signature,
        width: body.width,
        height: body.height,
    }
}

//- Hasta `limit` tareas a la vez: con 10 fotos no se saturan ni el navegador ni la conexión
export async function runPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
    let next = 0

    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, async () => {
            while (next < items.length) {
                const item = items[next++]
                await task(item)
            }
        }),
    )
}