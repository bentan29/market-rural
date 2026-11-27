const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function buildVerifyEmail({ name, url }: { name: string; url: string }) {
    const subject = 'Confirmá tu email en MarketRural'

    const text = [
        `Hola ${name},`,
        '',
        'Para activar tu cuenta, confirmá tu email con este enlace (vale 24 horas):',
        '',
        url,
        '',
        'Si no creaste una cuenta en MarketRural, ignorá este correo.',
    ].join('\n')

    const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#0f2e2a">
            <p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#4d7c0f;margin:0 0 16px">MarketRural</p>
            <h1 style="font-size:22px;margin:0 0 12px">Confirmá tu email</h1>
            <p style="line-height:1.5">Hola ${escapeHtml(name)}, para activar tu cuenta confirmá tu email. El enlace vale 24 horas.</p>
            <p style="margin:24px 0">
                <a href="${escapeHtml(url)}" style="display:inline-block;background:#84cc16;color:#1a2e05;padding:12px 24px;border-radius:2px;font-weight:700;text-decoration:none">Confirmar mi email</a>
            </p>
            <p style="font-size:13px;color:#555;line-height:1.5">Si el botón no funciona, copiá este enlace en tu navegador:<br>${escapeHtml(url)}</p>
            <p style="font-size:13px;color:#555">Si no creaste una cuenta en MarketRural, ignorá este correo.</p>
        </div>`

    return { subject, text, html }
}