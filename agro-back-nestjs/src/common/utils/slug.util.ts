import { randomBytes } from 'crypto'

//- "Tractor John Deere 6110J" -> "tractor-john-deere-6110j"
export function slugify(text: string, maxLength = 60): string {
    return text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, maxLength)
        .replace(/-+$/, '')
}

export const randomSuffix = () => randomBytes(3).toString('hex')

//- Slug "lindo" para URLs públicas: base, base-2, base-3... y si todo está tomado, base-<random>
export async function uniqueSlug(
    text: string,
    exists: (slug: string) => Promise<boolean>,
): Promise<string> {
    const base = slugify(text) || 'item'
    if (!(await exists(base))) return base

    for (let i = 2; i <= 5; i++) {
        const candidate = `${base}-${i}`
        if (!(await exists(candidate))) return candidate
    }
    return `${base}-${randomSuffix()}`
}