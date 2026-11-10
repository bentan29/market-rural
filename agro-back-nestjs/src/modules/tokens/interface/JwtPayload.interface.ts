import { Role } from '@prisma/client';

export interface JwtPayloadInterface {
    id: string;   // userId
    role: Role;
    sid: string;   // sessionId
}