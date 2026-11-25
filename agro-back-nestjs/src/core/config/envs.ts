import z from "zod"
import 'dotenv/config'

const envsSchema = z.object({
    PORT: z.coerce.number(),

    JWT_SECRET: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    REDIS_PASSWORD: z.string(),

    REDIS_TLS: z.enum(["true", "false"])
        .transform((value) => value === "true"),

    RESEND_API_KEY: z.string(),
    MAIL_FROM: z.string(),

    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
})

const result = envsSchema.safeParse(process.env)

if (!result.success) {
    throw new Error(
        `Config validation error: ${result.error.message}`,
    );
}

export const envs = {
    port: result.data.PORT,

    jwtSecret: result.data.JWT_SECRET,

    redisHost: result.data.REDIS_HOST,
    redisPort: result.data.REDIS_PORT,
    redisPassword: result.data.REDIS_PASSWORD,
    redisTls: result.data.REDIS_TLS,

    resendApiKey: result.data.RESEND_API_KEY,
    mailFrom: result.data.MAIL_FROM,

    cloudinaryCloudName: result.data.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: result.data.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: result.data.CLOUDINARY_API_SECRET
}