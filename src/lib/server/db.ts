import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

// Detect Cloudflare Workers / Edge environment (no Node.js process.versions)
const isEdgeRuntime =
	typeof process === 'undefined' ||
	typeof (process as any).versions === 'undefined' ||
	!(process as any).versions?.node;

function createPrismaClient(): PrismaClient {
	// Only use the libsql adapter in Cloudflare Workers (Edge runtime)
	// In Node.js / dev mode, use the standard SQLite file driver — much simpler
	if (isEdgeRuntime && env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN) {
		// Dynamic imports so this branch is tree-shaken in non-Edge builds
		// This is evaluated synchronously on first load in Edge only
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { createClient } = require('@libsql/client/web');
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { PrismaLibSql } = require('@prisma/adapter-libsql');
			const libsql = createClient({
				url: env.TURSO_DATABASE_URL,
				authToken: env.TURSO_AUTH_TOKEN
			});
			const adapter = new PrismaLibSql(libsql);
			return new PrismaClient({ adapter } as any);
		} catch (e) {
			console.error('[db] Edge adapter init failed:', e);
		}
	}

	// Standard Prisma for Node.js dev/build — reads DATABASE_URL from env
	return new PrismaClient({ log: ['error'] });
}

declare const globalThis: { _prisma?: PrismaClient } & typeof global;

export const db: PrismaClient = globalThis._prisma ?? createPrismaClient();

// Cache in dev to survive HMR
if (!isEdgeRuntime) {
	globalThis._prisma = db;
}
