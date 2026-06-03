import { buildUserContext } from '$lib/server/ai/context.js';
import * as nvidia from '$lib/server/ai/nvidia.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });

	try {
		const { message } = await request.json();
		if (!message?.trim()) return new Response('Message required', { status: 400 });

		const context = await buildUserContext(locals.user.id);
		const engine = nvidia;

		// Try streaming first (fastest UX)
		const stream = await engine.generateAIStream(message, context);

		if (stream) {
			return new Response(stream, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'X-Content-Type-Options': 'nosniff',
					'Cache-Control': 'no-cache, no-transform'
				}
			});
		}

		// Fallback: non-streaming
		const content = await engine.generateAIResponse(message, context);
		return new Response(content, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	} catch (error) {
		console.error('AI Chat Error:', error);
		return new Response('Error processing message', { status: 500 });
	}
};
