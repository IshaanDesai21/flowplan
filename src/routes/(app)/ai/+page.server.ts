import { db } from '$lib/server/db.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	// Fetch or create the active conversation
	let conversation = await db.aIConversation.findFirst({
		where: { userId },
		include: { messages: { orderBy: { createdAt: 'asc' } } },
		orderBy: { updatedAt: 'desc' }
	});

	if (!conversation) {
		conversation = await db.aIConversation.create({
			data: {
				userId,
				title: 'Productivity Assistant',
				messages: {
					create: {
						role: 'assistant',
						content: "Hi! I'm your FlowPlan AI assistant. How can I help you organize your day?"
					}
				}
			},
			include: { messages: true }
		});
	}

	return {
		conversation
	};
};
