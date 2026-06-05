// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: 
				{ 
					id: string;
					email: string;
					name: string;
					avatarUrl: string | null;
					isDemo: boolean
				 } |
				null
			;
			session: { id: string; expiresAt: Date } | null
		}

		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties
		}
	}
}

export {};
