import { PrismaClient } from '../../generated/prisma/client.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		datasourceUrl: process.env.DATABASE_URL ?? 'postgresql://flowplan:flowplan@localhost:5432/flowplan'
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = db;
}
