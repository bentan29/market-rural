//- Mismo criterio que el backend (phone.util.ts)
const DIAL_CODES: Record<string, string> = {
    UY: '598',
    AR: '54',
    PE: '51',
    BR: '55',
    PY: '595',
 }

export function toInternationalDigits(phone: string, country: string): string | null {
  const raw = phone.trim()
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 7) return null
  if (raw.startsWith("+")) return digits

  const dial = DIAL_CODES[country]
  return dial ? dial + digits.replace(/^0+/, "") : null
}

export function whatsappUrl(phone: string, country: string, text?: string): string | null {
  const number = toInternationalDigits(phone, country)
  if (!number) return null
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`
}

export function telUrl(phone: string, country: string): string | null {
  const number = toInternationalDigits(phone, country)
  return number ? `tel:+${number}` : null
}