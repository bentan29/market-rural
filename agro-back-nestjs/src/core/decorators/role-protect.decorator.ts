import { SetMetadata } from '@nestjs/common'
import { Role } from '@prisma/client'

export const VALID_ROLES = [
    Role.ADMIN,
    Role.USER,
    Role.SELLER,
] as const
export type ValidRole = typeof VALID_ROLES[number]

export const META_ROLES = 'roles';

export const RoleProtected = (...roles: ValidRole[]) => {
    //- Metemos los roles que permitimos pasar en los metadata
    return SetMetadata(META_ROLES, roles)
}