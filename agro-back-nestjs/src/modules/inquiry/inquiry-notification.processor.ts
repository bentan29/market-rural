import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { INQUIRY_QUEUE } from "./inquiries.constants";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.module";
import { MailService } from "../mail/mail.service";
import { Job } from "bullmq";
import { buildInquiryEmail } from "./inquiry-emails";

const describe = (error: unknown) => (error instanceof Error ? error.message : String(error))


// @Processor es El Worker (quien procesa el job)
@Processor(INQUIRY_QUEUE, {
    limiter: {
        max: 2, // 3 jobs
        duration: 1000 // cada 1 segundo
    }
})
export class InquiryNotificationsProcessor extends WorkerHost {

    private readonly logger = new Logger(InquiryNotificationsProcessor.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailService,
    ) {
        super()
    }

    //? -- process - método abstracto de la clase base WorkerHost
    async process(job: Job<{inquiryId: string}>): Promise<void> {
     
        const { inquiryId } = job.data

        //- Buscamos en base de datos la consulta
        const inquiry = await this.prisma.inquiry.findUnique({
            where: { id: inquiryId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                message: true,
                emailSentAt: true,
                whatsappSentAt: true,
                listing: { select: { slug: true, title: true } },
                seller: {
                    select: {
                        displayName: true,
                        whatsapp: true,
                        country: true,
                        user: { select: { email: true } },
                    },
                },
            },
        })

        //- La borraron mientras esperaba en la cola: no hay nada que enviar
        if (!inquiry) return

        const { seller, listing } = inquiry
        const errors: string[] = [] // fallos transitorios: se reintentan
        const notes: string[] = []  // canales sin configurar: no tiene sentido reintentar

        //- Email: cada canal deja su marca al salir bien, así un reintento no repite lo que ya se envió
        if (!inquiry.emailSentAt) {
            if(!this.mail.isConfigured()) {
                notes.push('email: Resend no configurado')
            } else {
                try {
                    //- Creamos como va a ser el mail
                    const email = buildInquiryEmail({
                        sellerName: seller.displayName,
                        visitorName: inquiry.name,
                        visitorEmail: inquiry.email,
                        visitorPhone: inquiry.phone,
                        listingTitle: listing.title,
                        listingUrl: `${process.env.APP_URL ?? 'http://localhost:3000'}/maquinaria/${listing.slug}`,
                        message: inquiry.message,
                    })

                    //- Enviamos el mail
                    await this.mail.send({
                        to: seller.user.email,
                        replyTo: inquiry.email, // el vendedor responde directo al interesado
                        ...email,
                        //- Cubre la ventana entre "Resend envió" y "guardamos la marca"
                        idempotencyKey: `inquiry-email-${inquiry.id}`,
                    })

                    await this.prisma.inquiry.update({
                        where: { id: inquiry.id },
                        data: { emailSentAt: new Date() },
                    })
                } catch (error) {
                    errors.push(`email: ${describe(error)}`)
                }
            }
        }

        const problems = [...notes, ...errors]
        await this.prisma.inquiry.update({
            where: { id: inquiry.id },
            data: { notifyError: problems.length ? problems.join(' | ').slice(0, 500) : null },
        })

        //- Lanzar el error es lo que hace que BullMQ reintente (solo se repite el canal que falló)
        if (errors.length) throw new Error(errors.join(' | '))
    }


    //? -- Aca recien captura el error que retorna el throw new Erro, con el 'failed'
    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
            this.logger.error(`Consulta ${job.data.inquiryId} sin notificar tras ${job.attemptsMade} intentos: ${error.message}`)
        }
    }

} 