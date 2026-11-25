import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { envs } from 'src/core/config';

export type SendMailInputs = {
    to: string | string[]
    subject: string
    html: string
    text?: string
    replyTo?: string
    /** Evita duplicados si un reintento repite el envío */
    idempotencyKey?: string
}

@Injectable()
export class MailService {

    private readonly logger = new Logger(MailService.name)
    private readonly resend: Resend | null
    private readonly from: string | undefined

    constructor() {
        const apiKey = envs.resendApiKey
        this.resend = apiKey ? new Resend(apiKey) : null
        this.from = envs.mailFrom

        if (!this.isConfigured()) {
            this.logger.warn('Resend no configurado (RESEND_API_KEY y MAIL_FROM): los emails no se envían')
        }
    }

    //? --- Retorna un booleano si no tenemos ni resend ni el mialFrom
    isConfigured(): boolean {
        return !!this.resend && !!this.from
    }

    //? --- Devuleve el id del email en Resend, Lanza un error si falla (para que la cola reintente)
    async send({idempotencyKey, ...mail}: SendMailInputs): Promise<string> {
        if (!this.resend || !this.from) throw new Error('Resend no configurado')

        //- El SDK NO lanza cuando la API responde con un error: lo devuelve en `error`
        const { data, error } = await this.resend.emails.send(
            { from: this.from, ...mail },
            idempotencyKey ? { idempotencyKey } : undefined,
        )
        if (error) throw new Error(`Resend (${error.name}): ${error.message}`)

        return data?.id ?? ''
    }

}
