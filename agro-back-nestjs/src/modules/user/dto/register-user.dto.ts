import { Transform } from "class-transformer"
import { Equals, IsEmail, IsString, MinLength } from "class-validator"

export class RegisterUserDto {

    @IsString()
    fullName: string
    
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    email: string;
    
    @IsString()
    @MinLength(6)
    password: string

    @Equals(true, { message: 'Tenés que aceptar los términos y condiciones' })
    acceptTerms: boolean

}