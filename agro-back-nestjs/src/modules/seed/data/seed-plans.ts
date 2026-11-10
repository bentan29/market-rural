import { Currency } from "@prisma/client";

export interface SeedPlan {
  name: string;
  price: number;
  currency: Currency;
  maxListings: number;
  maxFeatured: number;
  features: string[];
  isActive?: boolean;
}

export const SEED_PLANS: SeedPlan[] = [
    {
        name: 'FREE',
        currency: Currency.USD,
        price: 0,
        maxListings: 100,
        maxFeatured: 3,
        features: [
            "Sin limite de publicaiciones",
            "Perfil Basico",
            "Contactos por mail",
        ],
        isActive: true
    }
]