import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { VerificationPurpose } from '@prisma/client'
import { Queue } from 'bullmq'
import { createHash, randomBytes } from 'node:crypto'
import { PrismaService } from 'src/core/prisma/prisma.module'
import { MAIL_QUEUE } from 'src/modules/mail/constants/mail.constants'

const PURPOSE = VerificationPurpose.EMAIL_VERIFY
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const COOLDOWN_MS = 60 * 1000
const MAX_PER_HOUR = 5
const HOUR_MS = 60 * 60 * 1000

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

//- Solo rutas internas: empiezan con una sola "/" y no llevan caracteres raros. Evita redirecciones a sitios externos
export function safeNextPath(raw?: string | null): string | null {
    if (!raw || raw.length > 200) return null
    return /^\/(?!\/)[A-Za-z0-9\-._~%/?=&+#]*$/.test(raw) ? raw : null
}

@Injectable()
export class EmailVerificationService {
    
    private readonly logger = new Logger(EmailVerificationService.name)

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue(MAIL_QUEUE) private readonly queue: Queue,
    ) { }


    //? ---- Encola el correo. Nunca lanza: si falla, el registro no tiene por qué caerse (se puede pedir de nuevo)
    async enqueue(userId: string, next?: string | null) {
        try {
            await this.queue.add(
                'verify-email',
                { userId, next: safeNextPath(next) },
                {
                    jobId: `verify-email-${userId}`, // mientras haya uno pendiente, un segundo pedido no se duplica
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 30_000 },
                    //- Ambos en true: si quedara retenido, bloquearía los pedidos siguientes con el mismo jobId
                    removeOnComplete: true,
                    removeOnFail: true,
                },
            )
        } catch (error) {
            this.logger.error(`No se pudo encolar la verificación de ${userId}: ${error instanceof Error ? error.message : error}`)
        }
    }


    //? ---- Reenvío pedido por el usuario (con espera y tope por hora)
    async requestResend(user: { id: string; emailVerifiedAt: Date | null }, next?: string) {
        if (user.emailVerifiedAt) return { ok: true, alreadyVerified: true }

        const now = Date.now()
        const recent = await this.prisma.verificationToken.findMany({
            where: { userId: user.id, purpose: PURPOSE, createdAt: { gte: new Date(now - HOUR_MS) } },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        })

        if (recent.length >= MAX_PER_HOUR) {
            throw new HttpException(
                { message: 'Pediste demasiados correos. Probá de nuevo más tarde.', retryAfter: 600 },
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }

        const last = recent[0]
        if (last) {
            const wait = COOLDOWN_MS - (now - last.createdAt.getTime())
            if (wait > 0) {
                throw new HttpException(
                    { message: 'Esperá un momento antes de pedir otro correo.', retryAfter: Math.ceil(wait / 1000) },
                    HttpStatus.TOO_MANY_REQUESTS,
                )
            }
        }

        await this.enqueue(user.id, next)
        return { ok: true, alreadyVerified: false }
    }


    //? ---- Lo llama el procesador de la cola: crea el token e invalida los anteriores
    async issueToken(userId: string, next: string | null): Promise<string> {
        const raw = randomBytes(32).toString('base64url')
        const now = new Date()

        await this.prisma.$transaction([
            //- Solo vale el último enlace que se envió
            this.prisma.verificationToken.updateMany({
                where: { userId, purpose: PURPOSE, usedAt: null },
                data: { usedAt: now },
            }),
            this.prisma.verificationToken.create({
                data: {
                    userId,
                    purpose: PURPOSE,
                    tokenHash: sha256(raw), // en la base nunca queda el token real
                    next,
                    expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
                },
            }),
        ])

        return raw
    }


    //? ---- Confirma el email con el token del enlace
    async verify(rawToken: string) {
        const now = new Date()

        const token = await this.prisma.verificationToken.findUnique({
            where: { tokenHash: sha256(rawToken) },
            select: { id: true, userId: true, purpose: true, next: true, expiresAt: true, usedAt: true },
        })

        if (!token || token.purpose !== PURPOSE) {
            throw new BadRequestException({ message: 'El enlace no es válido.', code: 'TOKEN_INVALID' })
        }

        //- Un clic repetido (o el mismo enlace abierto dos veces) no es un error si el email ya quedó verificado
        const user = await this.prisma.user.findUnique({
            where: { id: token.userId },
            select: { emailVerifiedAt: true },
        })
        if (user?.emailVerifiedAt) return { ok: true, next: token.next }

        if (token.usedAt) {
            throw new BadRequestException({
                message: 'Este enlace ya no es válido porque pediste uno más nuevo. Revisá tu correo.',
                code: 'TOKEN_REPLACED',
            })
        }
        if (token.expiresAt <= now) {
            throw new BadRequestException({ message: 'El enlace venció. Pedí uno nuevo.', code: 'TOKEN_EXPIRED' })
        }

        //- Atómico: el token se consume y el email se marca como verificado, o no pasa nada
        const consumed = await this.prisma.$transaction(async (tx) => {
            const { count } = await tx.verificationToken.updateMany({
                where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
                data: { usedAt: now },
            })
            if (count === 0) return false

            await tx.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: now } })
            return true
        })

        if (!consumed) {
            throw new BadRequestException({ message: 'El enlace ya no es válido. Pedí uno nuevo.', code: 'TOKEN_INVALID' })
        }

        return { ok: true, next: token.next }
    }
}