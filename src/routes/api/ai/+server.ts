import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

const SYSTEM_PROMPT = `You are FlowPlan AI, a helpful productivity assistant. You help users manage their tasks, calendar events, and schedules. Be concise, friendly, and actionable. If the user asks you to create tasks, events, or reminders, format them clearly. Use markdown when helpful.`;

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const { message, conversationId } = await request.json();
	if (!message) return json({ error: 'Message required' }, { status: 400 });

	let convoId = conversationId;

	// Create new conversation if none provided
	if (!convoId) {
		const convo = await db.aIConversation.create({
			data: {
				userId: locals.user.id,
				title: message.slice(0, 50)
			}
		});
		convoId = convo.id;
	}

	// Save user message
	await db.aIMessage.create({
		data: { conversationId: convoId, role: 'user', content: message }
	});

	let reply = '';

	// Try Gemini API
	const apiKey = process.env.GEMINI_API_KEY;
	if (apiKey) {
		try {
			const { GoogleGenerativeAI } = await import('@google/generative-ai');
			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

			// Get conversation history
			const history = await db.aIMessage.findMany({
				where: { conversationId: convoId },
				orderBy: { createdAt: 'asc' },
				take: 20
			});

			const chat = model.startChat({
				history: history.slice(0, -1).map((m) => ({
					role: m.role === 'assistant' ? 'model' : 'user',
					parts: [{ text: m.content }]
				}))
			});

			const result = await chat.sendMessage(SYSTEM_PROMPT + '\n\nUser: ' + message);
			reply = result.response.text();
		} catch (err) {
			console.error('Gemini API error:', err);
			reply = getMockResponse(message);
		}
	} else {
		reply = getMockResponse(message);
	}

	// Save assistant message
	await db.aIMessage.create({
		data: { conversationId: convoId, role: 'assistant', content: reply }
	});

	return json({ reply, conversationId: convoId });
};

function getMockResponse(message: string): string {
	const lower = message.toLowerCase();

	if (lower.includes('task') || lower.includes('todo')) {
		return `Here's how I'd break that down:\n\n1. **Define scope** — Clarify exactly what needs to be done\n2. **Set a deadline** — Give yourself a realistic target\n3. **Break into subtasks** — Smaller items are easier to start\n\nWould you like me to create these as tasks in FlowPlan?`;
	}
	if (lower.includes('schedule') || lower.includes('calendar') || lower.includes('meeting')) {
		return `I'd suggest blocking out focused time for this. Here's a recommended schedule:\n\n- **Morning (9-11 AM)** — Deep work block\n- **After lunch (1-2 PM)** — Follow-up and communication\n- **Afternoon (3-4 PM)** — Review and planning\n\nWant me to add these time blocks to your calendar?`;
	}
	if (lower.includes('productivity') || lower.includes('efficient')) {
		return `Here are some productivity tips:\n\n- **Two-minute rule** — If it takes less than 2 minutes, do it now\n- **Time boxing** — Set fixed time limits for tasks\n- **Batch similar tasks** — Group emails, calls, etc.\n- **Take breaks** — Use the Pomodoro technique (25 min work / 5 min break)\n\nYour current completion rate is looking good! Keep it up.`;
	}
	if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
		return `Hey there! I'm your FlowPlan AI assistant. I can help you with:\n\n- **Task management** — Create and organize tasks\n- **Scheduling** — Plan your calendar and time blocks\n- **Productivity tips** — Get personalized advice\n- **Insights** — Understand your work patterns\n\nWhat would you like help with?`;
	}

	return `Great question! Here's my take:\n\nBased on your current workload, I'd recommend prioritizing your most important task first thing in the morning when your energy is highest.\n\n**Quick action items:**\n1. Review your task list for today\n2. Identify your top 3 priorities\n3. Block focus time on your calendar\n\nNeed help with anything specific? I can create tasks, schedule events, or suggest optimizations.`;
}
