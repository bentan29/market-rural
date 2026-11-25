import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import { createInterface } from 'node:readline/promises'

//- Uso: tsx --env-file=.env src/modules/seed/clear/clear.ts [--remote] [--cloudinary] [--yes]
const prisma = new PrismaClient()

const flags = new Set(process.argv.slice(2))
const withCloudinary = flags.has('--cloudinary') // además borra las fotos que esta base referencia
const allowRemote = flags.has('--remote')        // permiso explícito para una base que no es local
const skipPrompt = flags.has('--yes')            // solo se respeta si la base es local

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'host.docker.internal'])

function fail(message: string): never {
    console.error(`✖ ${message}`)
    process.exit(1)
}

//- Antes de borrar nada: ¿es esta la base que querés vaciar?
async function guard() {
    const raw = process.env.DATABASE_URL
    if (!raw) fail('Falta DATABASE_URL')
    if (process.env.NODE_ENV === 'production') fail('Este script no corre con NODE_ENV=production')

    let url: URL
    try {
        url = new URL(raw)
    } catch {
        fail('DATABASE_URL no es una URL válida')
    }

    const host = url.hostname
    const database = url.pathname.replace(/^\//, '')
    const isLocal = LOCAL_HOSTS.has(host)

    if (!isLocal && !allowRemote) {
        fail(`La base está en "${host}", que no es local. Si es lo que querés, agregá --remote al comando`)
    }

    console.log(`Base: ${database}  |  Servidor: ${host}${isLocal ? '' : '  (REMOTO)'}`)

    if (skipPrompt && isLocal) return

    const rl = createInterface({ input: process.stdin, output: process.stdout })
    const answer = await rl.question(`Escribí el nombre de la base (${database}) para confirmar: `)
    rl.close()

    if (answer.trim() !== database) fail('Cancelado: el nombre no coincide.')
}

//- Borra de Cloudinary SOLO las fotos que esta base referencia (no toca nada que no sea suyo)
//- Se hace ANTES de vaciar: después ya no quedan los publicId. Si falla, se aborta sin tocar la base
async function deleteCloudinaryImages() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        fail('Falta configurar CLOUDINARY_* para usar --cloudinary')
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    })

    const ids = (await prisma.listingImage.findMany({ select: { publicId: true } })).map((row) => row.publicId)

    try {
        //- La API admite hasta 100 por llamada
        for (let i = 0; i < ids.length; i += 100) {
            await cloudinary.api.delete_resources(ids.slice(i, i + 100), { invalidate: true })
        }
    } catch (error) {
        fail(`No se pudieron borrar las fotos de Cloudinary (¿le falta el permiso "delete" a la key?): ${(error as Error).message ?? error}`)
    }

    console.log(`Cloudinary: ${ids.length} fotos borradas`)
}

async function main() {
    await guard()

    if (withCloudinary) await deleteCloudinaryImages()

    //- Todas las tablas del esquema, menos la de migraciones: si mañana agregás un modelo, entra solo
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`

    if (tables.length === 0) fail('No hay tablas para vaciar (¿corriste las migraciones?)')

    //- Los nombres salen de la propia base (pg_tables), por eso es seguro armar la consulta con ellos
    const list = tables.map((t) => `"${t.tablename.replace(/"/g, '""')}"`).join(', ')

    //- CASCADE resuelve el orden de las claves foráneas; RESTART IDENTITY reinicia los contadores
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`)

    console.log(`✔ Base vaciada: ${tables.length} tablas`)
}

main()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())