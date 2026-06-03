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
		const adapter = new PrismaLibSql(libsql);
		return new PrismaClient({ adapter, log: ['error'] } as any);
	}

	// Fallback: local SQLite file for development
	return new PrismaClient({ log: ['error'] });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = db;
}
