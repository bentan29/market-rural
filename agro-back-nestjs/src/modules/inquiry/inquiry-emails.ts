const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type InquiryEmailData = {
    sellerName: string
    visitorName: string
    visitorEmail: string
    visitorPhone: string | null
    listingTitle: string
    listingUrl: string
    message: string
}

export function buildInquiryEmail(d: InquiryEmailData) {
    //- Sin saltos de línea en el asunto (inyección de cabeceras)
    const subject = `Nueva consulta: ${d.listingTitle}`.replace(/[\r\n]+/g, ' ').slice(0, 150)

    const text = [
        `Hola ${d.sellerName},`,
        '',
        `${d.visitorName} te escribió por "${d.listingTitle}":`,
        '',
        d.message,
        '',
        `Email: ${d.visitorEmail}`,
        ...(d.visitorPhone ? [`Teléfono: ${d.visitorPhone}`] : []),
        '',
        `Publicación: ${d.listingUrl}`,
        'Podés responder directamente a este correo.',
    ].join('\n')

    const html = `
        <p>Hola ${escapeHtml(d.sellerName)},</p>
        <p><strong>${escapeHtml(d.visitorName)}</strong> te escribió por
           <a href="${escapeHtml(d.listingUrl)}">${escapeHtml(d.listingTitle)}</a>:</p>
        <blockquote style="border-left:3px solid #84cc16;margin:0;padding:4px 12px;color:#333;white-space:pre-wrap">${escapeHtml(d.message)}</blockquote>
        <p>Email: ${escapeHtml(d.visitorEmail)}${d.visitorPhone ? `<br>Teléfono: ${escapeHtml(d.visitorPhone)}` : ''}</p>
        <p style="color:#666;font-size:13px">Podés responder directamente a este correo.</p>`

    return { subject, text, html }
}