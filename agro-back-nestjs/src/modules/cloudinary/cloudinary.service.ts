import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import { timingSafeEqual } from 'crypto'
import { CLOUDINARY_UNATTACHED_TAG } from 'src/common/constants/listing.constants'
import { envs } from 'src/core/config'

//- Lo que devuelve Cloudinary al terminar una subida y reenvía el navegador
export type UploadProof = { publicId: string; version: number; signature: string }

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name)

    private readonly cloudName = envs.cloudinaryCloudName
    private readonly apiKey = envs.cloudinaryApiKey
    private readonly apiSecret = envs.cloudinaryApiSecret

    constructor() {
        if (this.isConfigured()) {
            cloudinary.config({
                cloud_name: this.cloudName,
                api_key: this.apiKey,
                api_secret: this.apiSecret,
                secure: true,
            })
        } else {
            this.logger.warn('Cloudinary no configurado (CLOUDINARY_*): no se pueden subir fotos')
        }
    }

    isConfigured(): boolean {
        return !!(this.cloudName && this.apiKey && this.apiSecret)
    }

    //- Carpeta propia de cada vendedor: la firma la fija, así nadie sube a la carpeta de otro
    private folderFor(sellerId: string) {
        return `marketrural/listings/${sellerId}`
    }

    //? ---- Firma para que el navegador suba directo a Cloudinary
    signUpload(sellerId: string) {
        if (!this.isConfigured()) throw new ServiceUnavailableException('El servicio de fotos no está disponible')

        const params = {
            timestamp: Math.round(Date.now() / 1000),
            folder: this.folderFor(sellerId),
            //- Hasta que se asocia a una publicación, la foto queda marcada como "sin usar"
            tags: CLOUDINARY_UNATTACHED_TAG,
            allowed_formats: 'jpg,png,webp',
            //- Red de seguridad: aunque el navegador no achique la foto, Cloudinary guarda como máximo 2400 px
            transformation: 'c_limit,w_2400,h_2400',
        }

        return {
            cloudName: this.cloudName,
            apiKey: this.apiKey,
            ...params,
            signature: cloudinary.utils.api_sign_request(params, this.apiSecret!),
        }
    }

    //? ---- ¿La foto la subió de verdad este vendedor?
    //- Carpeta suya + firma de la respuesta de Cloudinary (se calcula con public_id y version)
    isValidUpload(sellerId: string, proof: UploadProof): boolean {
        if (!this.apiSecret) return false
        if (!proof.publicId.startsWith(`${this.folderFor(sellerId)}/`)) return false

        const expected = cloudinary.utils.api_sign_request(
            { public_id: proof.publicId, version: proof.version },
            this.apiSecret,
        )

        const a = Buffer.from(expected)
        const b = Buffer.from(proof.signature)
        const valid = a.length === b.length && timingSafeEqual(a, b)

        if (!valid) this.logger.warn(`Firma de subida inválida para ${proof.publicId}`)
        return valid
    }

    //? ---- Borra archivos de Cloudinary (y de la caché de su CDN)
    async destroy(publicIds: string[]) {
        if (publicIds.length === 0 || !this.isConfigured()) return

        const results = await Promise.allSettled(
            publicIds.map((id) => cloudinary.uploader.destroy(id, { invalidate: true })),
        )

        results.forEach((result, i) => {
            if (result.status === 'rejected') {
                this.logger.error(`No se pudo borrar ${publicIds[i]} de Cloudinary: ${String(result.reason)}`)
            }
        })
    }

    //? ---- Quita la etiqueta "sin usar": la foto ya pertenece a una publicación
    async untag(publicIds: string[]) {
        if (publicIds.length === 0 || !this.isConfigured()) return

        try {
            await cloudinary.uploader.remove_tag(CLOUDINARY_UNATTACHED_TAG, publicIds)
        } catch (error) {
            //- No es grave: la limpieza diaria vuelve a quitarla si la foto está en uso
            this.logger.error(`No se pudo quitar la etiqueta: ${String(error)}`)
        }
    }

    //? ---- Fotos "sin usar" con más de X tiempo
    async findStaleUnattached(olderThanMs: number): Promise<string[]> {
        if (!this.isConfigured()) return []

        const result = await cloudinary.api.resources_by_tag(CLOUDINARY_UNATTACHED_TAG, { max_results: 500 })
        const limit = Date.now() - olderThanMs

        return (result.resources as { public_id: string; created_at: string }[])
            .filter((resource) => new Date(resource.created_at).getTime() < limit)
            .map((resource) => resource.public_id)
    }
}