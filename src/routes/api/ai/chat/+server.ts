import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { generateAIResponse } from '$lib/server/ai/gemini.js';
import { buildUserContext } from '$lib/server/ai/context.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		const { conversationId, message } = await request.json();

		// Save user message
		await db.aIMessage.create({
			data: {
				conversationId,
				role: 'user',
				content: message
			}
		});

		// Fetch user context (tasks, events)
		const context = await buildUserContext(locals.user.id);

		// Get AI response (mock or real Gemini)
		const aiResponse = await generateAIResponse(message, context);

		// Save assistant message
		const savedMessage = await db.aIMessage.create({
			data: {
				conversationId,
				role: 'assistant',
				content: aiResponse
			}
		});

		// Update conversation timestamp
		await db.aIConversation.update({
			where: { id: conversationId },
			data: { updatedAt: new Date() }
		});

		return json({ message: savedMessage });
	} catch (error) {
		console.error('AI Chat Error:', error);
		return json({ error: 'Failed to process message' }, { status: 500 });
	}
};
