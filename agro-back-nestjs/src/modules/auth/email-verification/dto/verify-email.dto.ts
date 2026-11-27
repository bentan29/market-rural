import { IsString, Matches } from 'class-validator'

export class VerifyEmailDto {

    //- 32 bytes en base64url = 43 caracteres
    @IsString()
    @Matches(/^[A-Za-z0-9_-]{43}$/, { message: 'El enlace no es válido.' })
    token: string
}