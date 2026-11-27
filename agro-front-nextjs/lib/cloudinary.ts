import type { ImageLoaderProps } from "next/image"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const base = (transformation: string, src: string) =>
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${src}`

//- Tarjetas y miniaturas: recorte 4:3 centrado en lo importante (g_auto)
export const cloudinaryCardLoader = ({ src, width }: ImageLoaderProps) =>
    base(`f_auto,q_auto,c_fill,g_auto,ar_4:3,w_${width}`, src)

//- Foto completa (detalle): respeta la proporción y nunca la agranda
export const cloudinaryLoader = ({ src, width }: ImageLoaderProps) =>
    base(`f_auto,q_auto,c_limit,w_${width}`, src)

//- URL absoluta para metadatos y datos estructurados (Open Graph, Google)
export const cloudinaryUrl = (publicId: string, width = 1200) =>
    base(`f_auto,q_auto,c_limit,w_${width}`, publicId)