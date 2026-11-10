
//?- accesToken
export const JWT_ACCESS_EXPIRATION_SECONDS = 60 * 15 // 15 min -- SEGUNDOS
export const JWT_ACCESS_EXPIRATION_MS = 60 * 15 * 1000 //- 15 min -- MILISEGUNDOS

//* --- Para hacer pruebas con 1 minuto
// export const JWT_ACCESS_EXPIRATION_SECONDS = 60 // 1 min -- SEGUNDOS
// export const JWT_ACCESS_EXPIRATION_MS = 60 * 1000 // 1 min -- MILISEGUNDOS

//?- refreshtoken
export const REFRESH_TOKEN_SEVEN_DAYS = 60 * 60 * 24 * 7; // 7 dias para el refresh_token -- SEGUNDOS
export const REFRESH_TOKEN_SEVEN_DAYS_MS = 60 * 60 * 24 * 7 * 1000; // 7 dias para el refresh_token -- MILISEGUNDOS



export const REFRESH_GRACE_MS = 10_000; // ventana para refresh concurrente legítimo

export const SALT_ROUNDS = 10;


export const ACCESS_COOKIE_NAME = 'accessToken'
export const REFRESH_COOKIE_NAME = 'refresh_token'