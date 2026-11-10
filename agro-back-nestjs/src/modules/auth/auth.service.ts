import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from '../user/dto';
import { SALT_ROUNDS } from 'src/common/constants';
import * as bcrypt from 'bcrypt';
import { TokensService } from '../tokens/tokens.service';
import { SessionService } from '../session/session.service';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {

    //- Hash falso para que login tarde lo mismo exista o no el email (anti-enumeración)
    private readonly dummyHash = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

    constructor(
        private readonly usersService: UserService,
        private readonly sessionsService: SessionService,
        private readonly tokensService: TokensService,
    ) {}


    //? --- Registro de usuario
    register(registerUserDto: RegisterUserDto) {
        return this.usersService.registerUser(registerUserDto)
    }


    //? --- Login
    async login(loginDto: LoginUserDto, meta: {userAgent?: string; ipAddress?: string}) {

        const email = loginDto.email;
        const user = await this.usersService.findUserByEmail(email);

        //- Comparamos contraseñas
        const valid = await bcrypt.compare(loginDto.password, user?.password ?? this.dummyHash)
        if (!user || !user.password || !valid || !user.isActive) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        //*- Refresh_token
        const { refreshToken, hash } = this.tokensService.generateRefreshToken();
     
        //- Creamos la Session en DB
        const session = await this.sessionsService.create({
            userId: user.id,
            tokenHash: hash,
            userAgent: meta.userAgent, // userAgent: un texto que manda el navegador y dice quién es, por ejemplo Mozilla/5.0 (iPhone; ...) Safari/....
            ipAddress: meta.ipAddress, // ipAddress: desde dónde se conecta.
        });   

        //*- Access_token
        const accessToken = this.tokensService.signJwtToken({ id: user.id, role: user.role, sid: session.id })

        return {
            accessToken,
            refreshToken, //- RefreshToken
            user: { 
                id: user.id, 
                fullName: user.fullName,
                email: user.email, 
                role: user.role 
            },
        };
    }


    //? --- Refresh (rotación en cada uso) , refrescamos ambos tokens
    async refresh(refreshToken?: string) {
        if(!refreshToken) throw new UnauthorizedException('Sesión expirada o inválida');

        //- Creamos un hash con el refreshToken que nos llega, para compararlo con el que tenemos guardado
        const oldHash = this.tokensService.hashToken(refreshToken)

        //- Creamos un refreshToken y un hash nuevos
        const { refreshToken: newRefreshToken, hash: newHash } = this.tokensService.generateRefreshToken();

        //- Actualizamos la session. Cambiamos el hash viejo por el nuevo,
        // aca tambien buscamos que el oldHash exista en el tokenHash de la db
        const rotated = await this.sessionsService.rotate(oldHash, newHash);

        if (!rotated) {
            const reason = await this.sessionsService.detectReuse(oldHash);
            if (reason === 'race') {
                //- El front reintenta una vez: la otra request ya dejó la cookie nueva
                throw new UnauthorizedException({ message: 'Refresh en curso', code: 'REFRESH_RACE' });
            }
            throw new UnauthorizedException('Sesión expirada o inválida');
        }

        const session = await this.sessionsService.findByTokenHash(newHash);
        if (!session) throw new UnauthorizedException('Sesión expirada o inválida');

        //- Creamos el nuevo accesToken
        const newAccesToken = this.tokensService.signJwtToken({ id: session.user.id, role: session.user.role, sid: session.id })

        return {
            accessToken: newAccesToken,
            refreshToken: newRefreshToken,
        };
    }


    //? --- Logout (este dispositivo)
    async logout(refreshToken?: string): Promise<void> {
        if (!refreshToken) return;
        await this.sessionsService.revokeByTokenHash(this.tokensService.hashToken(refreshToken));
    }

    //? --- Logout de todos los dispositivos (usalo también en changePassword/resetPassword)
    logoutAll(userId: string) {
        return this.sessionsService.revokeAll(userId);
    }

    //? --- Tomamos todas las sessiones activas de un usuario por su id
    getSessions(userId: string) {
        return this.sessionsService.findAllActive(userId);
    }

    //? --- Cerramos solo la session que le indicamos
    revokeSession(userId: string, sessionId: string) {
        return this.sessionsService.revokeById(userId, sessionId);
    }

 

}
