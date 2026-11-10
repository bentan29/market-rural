import { Injectable } from '@nestjs/common';
import { JwtPayloadInterface } from './interface/JwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

type RefreshToken = {
    refreshToken: string; 
    hash: string
}

@Injectable()
export class TokensService {

    constructor(
        private readonly jwtService: JwtService
    ) {}


    //? --- Firmamos el access_token (JWT de vida corta, configurado en TokensModule)
    signJwtToken(payload: JwtPayloadInterface) {
        return this.jwtService.sign(payload)
    }
    

    //? --- Generamos un refresh token opaco (no es un JWT). Devolvemos también su hash: es lo único que se guarda en DB
    generateRefreshToken(): RefreshToken {
        // 1. randomBytes(32): genera 32 bytes aleatorios criptográficamente seguros (256 bits). Es imposible de adivinar.
        // 2. .toString('base64url') lo convierte a texto seguro para cookies y URLs (letras, números, - y _). Queda algo como k3J9xQ... de 43 caracteres.
        const token = randomBytes(32).toString('base64url');
        return { 
            refreshToken: token, 
            hash: this.hashToken(token) //- creamos un hash a partir del refresh_token
        };
    }


    //? --- Generamos un hash a partir del refreshToken
    //? --- SHA-256 del token (para guardar y para buscar sesiones)
    hashToken(token: string): string {
        //- Calcula el SHA-256 de ese texto, en hexadecimal (64 caracteres).
        return createHash('sha256').update(token).digest('hex');
    }



}
