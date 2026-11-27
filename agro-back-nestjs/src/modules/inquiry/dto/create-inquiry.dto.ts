import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))

//- La misma regla que el front: entre 7 y 15 dígitos en total
const PHONE_REGEX = /^(?=(?:\D*\d){7,15}\D*$)\+?[0-9\s-]{7,20}$/

export class CreateInquiryDto {

    @trim()
    @IsString({ message: 'Ingresá tu teléfono' })
    @Matches(PHONE_REGEX, { message: 'Teléfono inválido' })
    phone: string

    @trim()
    @IsString()
    @MinLength(10, { message: 'Escribí al menos 10 caracteres' })
    @MaxLength(1000, { message: 'Máximo 1000 caracteres' })
    message: string
}