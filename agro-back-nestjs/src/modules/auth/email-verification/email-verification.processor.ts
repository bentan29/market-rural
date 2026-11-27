import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { envs } from 'src/core/config'
import { PrismaService } from 'src/core/prisma/prisma.module'
import { MailService } from '../../mail/mail.service'
import { buildVerifyEmail } from '../../mail/templates/verify-email.template'
import { EmailVerificationService, sha256 } from './email-verification.service'
import { MAIL_QUEUE } from 'src/modules/mail/constants/mail.constants'

//- limiter: máximo de envíos por segundo, para no pasarse del límite de Resend
@Processor(MAIL_QUEUE, { limiter: { max: 2, duration: 1000 } })
export class EmailVerificationProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailVerificationProcessor.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailService,
        private readonly verification: EmailVerificationService,
    ) {
        super()
    }

    async process(job: Job<{ userId: string; next: string | null }>): Promise<void> {
        if (job.name !== 'verify-email') return

        const user = await this.prisma.user.findUnique({
            where: { id: job.data.userId },
            select: { id: true, email: true, fullName: true, emailVerifiedAt: true, isActive: true },
        })

        //- Ya verificó (otro enlace, otro dispositivo), la borraron o la desactivaron: no hay nada que enviar
        if (!user || user.emailVerifiedAt || !user.isActive) return

        //- El token se crea acá y no al pedirlo: así el secreto nunca pasa por Redis
        const token = await this.verification.issueToken(user.id, job.data.next)
        const url = `${envs.frontendUrl}/verificar-email?token=${encodeURIComponent(token)}`

        if (!this.mail.isConfigured()) {
            //- En desarrollo se muestra el enlace para poder probar el flujo sin Resend. En producción NUNCA se registra el token
            if (process.env.NODE_ENV !== 'production') {
                this.logger.warn(`[DEV] Resend no configurado. Enlace de verificación de ${user.email}: ${url}`)
            } else {
                this.logger.error('Resend no configurado: no se pudo enviar el correo de verificación')
            }
            return
        }

        const email = buildVerifyEmail({
            name: user.fullName?.trim() || user.email.split('@')[0],
            url,
        })

        await this.mail.send({
            to: user.email,
            ...email,
            //- Si Resend llegó a enviarlo pero el reintento se repite, no sale dos veces
            idempotencyKey: `verify-email-${sha256(token).slice(0, 32)}`,
        })
    }

    //- Solo se registra cuando ya no quedan reintentos
    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
            this.logger.error(`Verificación de ${job.data.userId} sin enviar tras ${job.attemptsMade} intentos: ${error.message}`)
        }
    }
}