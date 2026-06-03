import { warmupNvidia } from '$lib/server/ai/nvidia.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
	// Send warmup request asynchronously (don't wait for it)
	warmupNvidia();
	return new Response(JSON.stringify({ success: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
