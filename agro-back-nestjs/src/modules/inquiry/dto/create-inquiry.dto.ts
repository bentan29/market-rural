import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/

export class CreateInquiryDto {

    @trim()
    @IsString()
    @MinLength(2, { message: 'Ingresá tu nombre' })
    @MaxLength(80)
    name: string

    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail({}, { message: 'Ingresá un email válido' })
    @MaxLength(120)
    email: string

    @IsOptional()
    @trim()
    @Matches(PHONE_REGEX, { message: 'Teléfono inválido' })
    phone?: string

    @trim()
    @IsString()
    @MinLength(10, { message: 'Escribí al menos 10 caracteres' })
    @MaxLength(1000, { message: 'Máximo 1000 caracteres' })
    message: string
}