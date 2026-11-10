import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayloadInterface } from "../../tokens/interface/JwtPayload.interface";
import { PrismaService } from "src/core/prisma/prisma.module";
import { envs } from "src/core/config";
import { ACCESS_COOKIE_NAME } from "src/common/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {


    constructor(private prismaClient: PrismaService) {
        super({
            secretOrKey: envs.jwtSecret,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.[ACCESS_COOKIE_NAME] ?? null,
                (req) => {
                    const cookieHeader = req?.headers?.cookie ?? ''
                    const match = cookieHeader.match(/accessToken=([^;]+)/)
                    return match ? match[1] : null
                }
            ])
        })
    }

    async validate(payload: JwtPayloadInterface) {
        //- Una sola query: sesión vigente + su usuario
        const session = await this.prismaClient.session.findFirst({
            where: {
                id: payload.sid, //- sid = sesion id
                userId: payload.id,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
            include: { user: { omit: { password: true } } },
        });

        if (!session) throw new UnauthorizedException('Sesión inválida');
        if (!session.user.isActive) throw new UnauthorizedException('User is inactive, talk with an admin');

        return session.user;
    }

}