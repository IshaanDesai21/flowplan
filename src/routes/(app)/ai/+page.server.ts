import { db } from '$lib/server/db.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const isDemo = (locals.user as any).isDemo;

	if (isDemo) {
		// Provide a transient conversation for demo users — no DB needed
		return {
			conversation: {
				id: 'demo-conversation',
				userId,
				title: 'FlowPlan AI Assistant',
				messages: [
					{
						id: 'demo-msg-1',
						conversationId: 'demo-conversation',
						role: 'assistant',
						content:
							"Hi! I'm your **FlowPlan AI** assistant powered by NVIDIA.\n\nI can see your tasks and events — try asking me what to work on next, or how to plan your day!",
						createdAt: new Date().toISOString()
					}
				]
			}
		};
	}

	// Fetch or create the active conversation for authenticated users
	let conversation: any = null;
	try {
		conversation = await db.aIConversation.findFirst({
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
	} catch (e) {
		console.error('AI: failed to load conversation:', e);
		// Provide a fallback in-memory conversation
		conversation = {
			id: 'temp-conversation',
			userId,
			title: 'FlowPlan AI Assistant',
			messages: [{
				id: 'temp-msg-1',
				conversationId: 'temp-conversation',
				role: 'assistant',
				content: "Hi! I'm your FlowPlan AI assistant. How can I help you organize your day?",
				createdAt: new Date().toISOString()
			}]
		};
	}

	return {
		conversation
	};
};
