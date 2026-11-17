//- Prefijos de país. Para sumar uno, una línea acá y otra en SELLER_COUNTRIES
const DIAL_CODES: Record<string, string> = { 
    UY: '598',
    AR: '54',
    PE: '51',
    BR: '55',
    PY: '595',
}

//- Solo dígitos con código de país: "+598 99 123 456" -> "59899123456"; "099 123 456" (UY) -> "59899123456"
//- Ojo: los celulares de Argentina pueden necesitar un 9 después del 54. Confirmalo en la documentación de WhatsApp
export function toInternationalDigits(phone: string, country: string): string | null {
    const raw = phone.trim()
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 7) return null
    if (raw.startsWith('+')) return digits

    const dial = DIAL_CODES[country]
    if (!dial) return null

    return dial + digits.replace(/^0+/, '')
}