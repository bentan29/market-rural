import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'

//- Va DESPUÉS de AuthGuard('jwt'): usa el usuario que ese guard dejó en la request
@Injectable()
export class VerifiedEmailGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user = context.switchToHttp().getRequest<{ user?: User }>().user

        if (!user?.emailVerifiedAt) {
            //- El código le permite al front distinguir este caso y ofrecer el reenvío
            throw new ForbiddenException({ message: 'Verificá tu email para continuar.', code: 'EMAIL_NOT_VERIFIED' })
        }
        return true
    }
}