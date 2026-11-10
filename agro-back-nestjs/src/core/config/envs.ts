import z from "zod"
import 'dotenv/config'

const envsSchema = z.object({
    PORT: z.coerce.number(),

    JWT_SECRET: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    REDIS_PASSWORD: z.string(),
})

const result = envsSchema.safeParse(process.env)

if(!result.success) {
    throw new Error(
        `Config validation error: ${result.error.message}`,
    );
}

export const envs = {
    port: result.data.PORT,

    jwtSecret: result.data.JWT_SECRET,

    redisHost: result.data.REDIS_HOST,
    redisPort: result.data.REDIS_PORT,
    redisPassword: result.data.REDIS_PASSWORD
}