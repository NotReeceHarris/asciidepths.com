import { PrismaClient } from '@prisma/client';

declare global {
    // Add prisma to the global type
    var prisma: PrismaClient | undefined;
}