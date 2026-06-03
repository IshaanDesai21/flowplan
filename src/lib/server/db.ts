import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client/web';
import { env } from '$env/dynamic/private';

function createPrismaClient() {
	// If Turso credentials are present, use the libsql adapter (production/Vercel/Cloudflare)
	if (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN) {
		const libsql = createClient({
			url: env.TURSO_DATABASE_URL,
			authToken: env.TURSO_AUTH_TOKEN
		});
		const adapter = new PrismaLibSql(libsql as any);
		return new PrismaClient({ adapter, log: ['error'] } as any);
	}

	// Fallback: local SQLite file for development
	return new PrismaClient({ log: ['error'] });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = new Proxy({} as PrismaClient, {
	get(target, prop) {
		if (!globalForPrisma.prisma) {
			globalForPrisma.prisma = createPrismaClient();
		}
		return (globalForPrisma.prisma as any)[prop];
	}
});

if (process.env.NODE_ENV !== 'production') {
	// in dev, the proxy itself doesn't need to be assigned to global,
	// but the underlying client is cached in globalForPrisma.prisma
}
