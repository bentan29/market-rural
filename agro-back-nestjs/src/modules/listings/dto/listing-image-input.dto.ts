import { Type } from 'class-transformer'
import { IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator'

//- Lo que devuelve Cloudinary al subir. Nest lo vuelve a verificar con la firma: no se confía en el navegador
export class ListingImageInputDto {

    @IsString()
    @MaxLength(200)
    @Matches(/^[A-Za-z0-9_\-/]+$/, { message: 'Imagen inválida' })
    publicId: string

    @Type(() => Number)
    @IsInt()
    @Min(1)
    version: number

    //- SHA-1 (40) o SHA-256 (64) en hexadecimal
    @IsString()
    @Matches(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/, { message: 'Firma inválida' })
    signature: string

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20000)
    width: number

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20000)
    height: number
}