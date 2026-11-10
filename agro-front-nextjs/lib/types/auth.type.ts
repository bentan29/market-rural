export type SessionUser = {
    id: string
    fullName: string | null
    email: string
    role: 'USER' | 'SELLER' | 'ADMIN'
}

export const ACCESS_COOKIE_NAME = 'accessToken' // mismo valor que en el backend
export const REFRESH_COOKIE_NAME = 'refresh_token' // mismo valor que en el backend
