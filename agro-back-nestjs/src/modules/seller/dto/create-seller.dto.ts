import { Transform } from 'class-transformer'
import {
    IsIn, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength,
} from 'class-validator'
import { SELLER_COUNTRIES } from 'src/common/constants/seller.constants'

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))

//- Los formularios mandan "" en los campos vacíos: lo tratamos como "no vino"
const emptyToUndefined = () =>
    Transform(({ value }) =>
        typeof value === 'string' && value.trim() === '' ? undefined : value,
    )

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/

export class CreateSellerDto {

    @trim()
    @IsString()
    @MinLength(3, { message: 'Mínimo 3 caracteres' })
    @MaxLength(80, { message: 'Máximo 80 caracteres' })
    displayName: string

    @emptyToUndefined()
    @trim()
    @IsOptional()
    @IsString()
    @MaxLength(2000, { message: 'Máximo 2000 caracteres' })
    about?: string

    @trim()
    @IsString()
    @Matches(PHONE_REGEX, { message: 'Teléfono inválido' })
    phone: string

    @emptyToUndefined()
    @trim()
    @IsOptional()
    @Matches(PHONE_REGEX, { message: 'WhatsApp inválido' })
    whatsapp?: string

    @emptyToUndefined()
    @trim()
    @IsOptional()
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Ingresá una URL válida (con https://)' })
    @MaxLength(200)
    website?: string

    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @IsIn(SELLER_COUNTRIES, { message: 'País inválido' })
    country: string

    @trim()
    @IsString()
    @MinLength(2, { message: 'Ingresá la ubicación' })
    @MaxLength(120, { message: 'Máximo 120 caracteres' })
    location: string
}