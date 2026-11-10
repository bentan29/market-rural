import { Injectable } from '@nestjs/common';
import { REFRESH_GRACE_MS, REFRESH_TOKEN_SEVEN_DAYS_MS } from 'src/common/constants';
import { PrismaService } from 'src/core/prisma/prisma.module';

@Injectable()
export class SessionService {
    constructor(private readonly prisma: PrismaService) {}

    //?- Creamos la session en BD
    create(data: { userId: string; tokenHash: string; userAgent?: string; ipAddress?: string }) {
        return this.prisma.session.create({
            data: { 
                ...data, 
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_SEVEN_DAYS_MS) 
            },
        });
    }

    
    //?- Rotación atómica: solo una request puede ganar. true = rotó.
    async rotate(oldHash: string, newHash: string): Promise<boolean> {
        const now = new Date();
        const { count } = await this.prisma.session.updateMany({
            where: {
                tokenHash: oldHash,
                isActive: true,
                expiresAt: { gt: now }, // gt = greater than, osea mayor que ahora
                user: { isActive: true },
            },
            data: {
                tokenHash: newHash,
                prevTokenHash: oldHash,
                rotatedAt: now,
                expiresAt: new Date(now.getTime() + REFRESH_TOKEN_SEVEN_DAYS_MS),
            },
        });
        return count === 1;
    }


    //?- Buscamos session por el hash que genero el refreshtoken
    findByTokenHash(tokenHash: string) {
        return this.prisma.session.findUnique({
            where: { tokenHash },
            include: { user: { select: { id: true, role: true } } },
        });
    }


    //?- Se llama cuando rotate() falló: ¿carrera legítima, token robado o token inválido?
    async detectReuse(oldHash: string): Promise<'race' | 'stolen' | 'unknown'> {
        const session = await this.prisma.session.findFirst({
            where: {
                prevTokenHash: oldHash,
                isActive: true 
            },
        });
        if (!session?.rotatedAt) return 'unknown';

        if (Date.now() - session.rotatedAt.getTime() < REFRESH_GRACE_MS) return 'race';

        await this.prisma.session.update({ where: { id: session.id }, data: { isActive: false } });
        return 'stolen';
    }


    //?- Cerramos session pasamos a isActive:false
    async revokeByTokenHash(tokenHash: string): Promise<void> {
        await this.prisma.session.updateMany({ 
            where: { tokenHash }, 
            data: { isActive: false } 
        });
    }


    //?- Cerramos una session, userId en el where evita que alguien cierre sesiones ajenas
    async revokeById(userId: string, sessionId: string): Promise<void> {
        await this.prisma.session.updateMany({
            where: { 
                id: sessionId, userId 
            },
            data: { isActive: false },
        });
    }


    //?-- Cerramos todas las sessiones de un usuario isActive:false
    async revokeAll(userId: string): Promise<void> {
        await this.prisma.session.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        });
    }


    //?- Tomamos todas las sessiones activas de un usuario
    findAllActive(userId: string) {
        return this.prisma.session.findMany({
            where: { 
                userId, 
                isActive: true, 
                expiresAt: { gt: new Date() } 
            },
            select: { 
                id: true, 
                userAgent: true, 
                ipAddress: true, 
                createdAt: true, 
                rotatedAt: true 
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}