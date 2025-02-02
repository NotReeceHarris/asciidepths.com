import { PrismaClient } from '@prisma/client';

// Extend the global type to include the PrismaClient instance
declare global {
    let prisma: PrismaClient | undefined;
}

// Use the existing global instance or create a new one
const prisma: PrismaClient = global.prisma || new PrismaClient();

// In development, store the PrismaClient instance globally to avoid creating multiple instances
if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma;
}

export default prisma;