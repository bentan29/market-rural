
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.module';
import { SEED_PLANS } from './data/seed-plans';
import * as bcrypt from 'bcrypt';

import {
    Role,
    ListingOperation,
    ListingStatus,
    MachineCondition,
    Currency,
    RentPeriod,
} from '@prisma/client';

const SELLERS = [
    {
        name: 'Juan Pérez',
        email: 'juan@juan.com',
        slug: 'juan-perez',
        country: 'UY',
        location: 'Mercedes, Soriano',
        phone: '099123456',
    },
    {
        name: 'Pedro Gómez',
        email: 'pedro@pedro.com',
        slug: 'pedro-gomez',
        country: 'AR',
        location: 'Rosario, Santa Fe',
        phone: '3411234567',
    },
    {
        name: 'Carlos Silva',
        email: 'carlos@carlos.com',
        slug: 'carlos-silva',
        country: 'BR',
        location: 'Ribeirão Preto, São Paulo',
        phone: '16912345678',
    },
    {
        name: 'Lucas González',
        email: 'lucas@lucas.com',
        slug: 'lucas-gonzalez',
        country: 'PY',
        location: 'Asunción, Central',
        phone: '981123456',
    },
] as const;

const MACHINES = [
    {
        type: 'Tractor',
        models: ['John Deere', 'Massey Ferguson', 'New Holland', 'Case IH', 'Valtra'],
        horsepower: 120,
    },
    {
        type: 'Cosechadora',
        models: ['John Deere S550', 'Case IH Axial Flow', 'New Holland CR', 'Claas Lexion'],
        horsepower: 300,
    },
    {
        type: 'Pulverizadora',
        models: ['Metalfor', 'Pla', 'Jacto', 'John Deere'],
        horsepower: 180,
    },
    {
        type: 'Sembradora',
        models: ['Crucianelli', 'John Deere', 'Baldan', 'Tatu Marchesan'],
        horsepower: 100,
    },
    {
        type: 'Excavadora',
        models: ['Caterpillar', 'Komatsu', 'Volvo', 'JCB'],
        horsepower: 150,
    },
    {
        type: 'Retroexcavadora',
        models: ['JCB', 'Caterpillar', 'New Holland', 'Case'],
        horsepower: 100,
    },
    {
        type: 'Pala cargadora',
        models: ['Caterpillar', 'Volvo', 'Komatsu', 'LiuGong'],
        horsepower: 180,
    },
    {
        type: 'Rotoenfardadora',
        models: ['New Holland', 'John Deere', 'Massey Ferguson', 'Claas'],
        horsepower: 90,
    },
    {
        type: 'Tolva',
        models: ['Cestari', 'Ascanelli', 'Ombú', 'Indecar'],
        horsepower: 0,
    },
    {
        type: 'Acoplado',
        models: ['Ombú', 'Ascanelli', 'Montecor', 'Cestari'],
        horsepower: 0,
    },
] as const;

const CURRENCIES: Record<string, Currency> = {
    UY: Currency.UYU,
    AR: Currency.ARS,
    BR: Currency.BRL,
    PY: Currency.PYG,
};

const BASE_PRICES: Record<string, number> = {
    UY: 85000,
    AR: 75000000,
    BR: 450000,
    PY: 550000000,
};

@Injectable()
export class SeedService {
    constructor(
        private readonly prismaClient: PrismaService,
    ) {}

    async runSeed() {
        // await this.seedPlans();
        await this.seedSellersAndListings();

        return {
            message: 'Seed completado ✅',
            sellers: 4,
            listings: 400,
        };
    }

    private async seedPlans() {
        console.log('🌱 Seeding planes...');

        for (const plan of SEED_PLANS) {
            await this.prismaClient.plan.upsert({
                where: { name: plan.name },
                update: plan,
                create: plan,
            });
        }
    }

    private async seedSellersAndListings() {
        console.log('🌱 Seeding vendedores y publicaciones...');

        const hashedPassword = await bcrypt.hash('12345678', 10);

        for (const sellerData of SELLERS) {
            // 1. Crear usuario
            const user = await this.prismaClient.user.upsert({
                where: {
                    email: sellerData.email,
                },
                update: {
                    fullName: sellerData.name,
                    password: hashedPassword,
                    role: Role.SELLER,
                    isActive: true,
                },
                create: {
                    fullName: sellerData.name,
                    email: sellerData.email,
                    password: hashedPassword,
                    role: Role.SELLER,
                    isActive: true,
                },
            });

            // 2. Crear vendedor
            const seller = await this.prismaClient.seller.upsert({
                where: {
                    slug: sellerData.slug,
                },
                update: {
                    userId: user.id,
                    displayName: sellerData.name,
                    country: sellerData.country,
                    location: sellerData.location,
                    phone: sellerData.phone,
                    whatsapp: sellerData.phone,
                },
                create: {
                    userId: user.id,
                    displayName: sellerData.name,
                    slug: sellerData.slug,
                    country: sellerData.country,
                    location: sellerData.location,
                    phone: sellerData.phone,
                    whatsapp: sellerData.phone,
                    about: `Vendedor de maquinaria rural en ${sellerData.location}.`,
                },
            });

            await this.seedSellerSubscription(seller.id);

            // 3. Generar 100 máquinas
            const listings = Array.from({ length: 100 }, (_, index) => {
                const machine = MACHINES[index % MACHINES.length];
                const model = machine.models[index % machine.models.length];

                const operation = index % 4 === 0
                    ? ListingOperation.RENT
                    : ListingOperation.SALE;

                const year = 2005 + (index % 21);

                const horsepower = machine.horsepower > 0
                    ? machine.horsepower + (index % 6) * 10
                    : null;

                const price =
                    BASE_PRICES[sellerData.country] *
                    (machine.horsepower > 0
                        ? 1 + machine.horsepower / 500
                        : 0.5) *
                    (1 + (index % 10) * 0.08);

                const rentPeriod = index % 3 === 0
                    ? RentPeriod.DAY
                    : index % 3 === 1
                        ? RentPeriod.WEEK
                        : RentPeriod.MONTH;

                return {
                    slug: `${sellerData.slug}-${machine.type
                        .toLowerCase()
                        .replace(/\s+/g, '-')}-${index + 1}`,

                    title: `${model} ${machine.type} ${year} - Unidad ${index + 1}`,

                    operation,

                    rentPeriod: operation === ListingOperation.RENT
                        ? rentPeriod
                        : null,

                    condition: index % 5 === 0
                        ? MachineCondition.NEW
                        : MachineCondition.USED,

                    currency: CURRENCIES[sellerData.country],

                    price: Number(price.toFixed(2)),

                    machineType: machine.type,

                    year,

                    hours: machine.horsepower > 0
                        ? 500 + (index * 137) % 9000
                        : null,

                    horsepower,

                    location: sellerData.location,

                    country: sellerData.country,

                    description: `${model} ${machine.type} en ${sellerData.location}. Año ${year}. Excelente oportunidad para el trabajo rural. Consultar disponibilidad y condiciones.`,

                    status: ListingStatus.PUBLISHED,

                    featuredUntil: null,

                    sellerId: seller.id,
                };
            });

            // 4. Insertar publicaciones sin duplicar
            const result = await this.prismaClient.listing.createMany({
                data: listings,
                skipDuplicates: true,
            });

            console.log(
                `✅ ${sellerData.name}: ${result.count} publicaciones creadas`,
            );
        }

        console.log('✅ Vendedores y publicaciones procesados.');
    }

    private async seedSellerSubscription(sellerId: string) {
    // Buscar el plan con mayor cantidad de publicaciones permitidas
    const plan = await this.prismaClient.plan.findFirst({
        where: {
            isActive: true,
        },
        orderBy: {
            maxListings: 'desc',
        },
    });

    if (!plan) {
        throw new Error('No hay planes activos para asignar a los vendedores.');
    }

    await this.prismaClient.subscription.upsert({
        where: {
            sellerId,
        },
        update: {
            planId: plan.id,
            status: 'ACTIVE',
            startedAt: new Date(),
            expiresAt: null,
            isComplimentary: true,
            cancelledAt: null,
        },
        create: {
            sellerId,
            planId: plan.id,
            status: 'ACTIVE',
            isComplimentary: true,
            startedAt: new Date(),
            expiresAt: null,
        },
    });
}
}
