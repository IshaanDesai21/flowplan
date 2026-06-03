import type { AIContext } from './context.js';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
const MODEL = 'meta/llama-3.1-70b-instruct';

const SYSTEM_PROMPT = `You are FlowPlan AI — a friendly, smart assistant built into FlowPlan, a personal productivity app. You have access to the user's tasks and upcoming calendar events.

PERSONALITY:
- Be warm, natural, and conversational. You're like a helpful friend who also happens to be very organised.
- You can engage in small talk, answer general questions, chat about anything — you are NOT limited to productivity topics.
- When the conversation is casual or off-topic, be genuine and engaging. Don't force tasks into every reply.
- However, when it feels natural (e.g. the user mentions being busy, stressed, or planning), gently reference their actual tasks or schedule as a helpful nudge — never in an intrusive way.
- Use light humour when appropriate. Be human.

FORMAT RULES:
- Use markdown: **bold** for emphasis, bullet lists for multiple points, headers for longer structured answers.
- Keep responses concise unless the user asks for detail.
- Express times in 12-hour AM/PM format (e.g. "9:00 AM", "2:30 PM").
- Never make up tasks or events that aren't in the user's context.
- If the user asks about their tasks or schedule, be specific and helpful using the context provided.`;


function buildContextString(context: AIContext): string {
	return `
CURRENT TIME: ${context.today}
UPCOMING TASKS (${context.tasks.length} total): ${JSON.stringify(context.tasks.slice(0, 15), null, 2)}
UPCOMING EVENTS (NEXT 7 DAYS, ${context.events.length} total): ${JSON.stringify(context.events.slice(0, 10), null, 2)}
`;
}

function buildMessages(message: string, contextString: string) {
	return [
		{ role: 'system', content: SYSTEM_PROMPT + '\n\nUser Context:\n' + contextString },
		{ role: 'user', content: message }
	];
}

/** Returns a streaming ReadableStream of text tokens from NVIDIA */
export async function generateAIStream(
	message: string,
	context: AIContext
): Promise<ReadableStream<Uint8Array> | null> {
	try {
		const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${NVIDIA_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: MODEL,
				messages: buildMessages(message, buildContextString(context)),
				temperature: 0.7,
				top_p: 0.95,
				max_tokens: 1024,
				stream: true
			})
		});

		if (!response.ok || !response.body) {
			console.error('NVIDIA API error (stream):', response.status, await response.text().catch(() => ''));
			return null;
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		return new ReadableStream<Uint8Array>({
			async start(controller) {
				let buffer = '';
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split('\n');
						buffer = lines.pop() ?? '';
						for (const line of lines) {
							const trimmed = line.trim();
							if (!trimmed || trimmed === 'data: [DONE]') continue;
							if (trimmed.startsWith('data: ')) {
								try {
									const json = JSON.parse(trimmed.slice(6));
									const content = json.choices?.[0]?.delta?.content;
									if (content) controller.enqueue(new TextEncoder().encode(content));
								} catch { /* skip malformed SSE */ }
							}
						}
					}
				} finally {
					controller.close();
				}
			}
		});
	} catch (err) {
		console.error('NVIDIA streaming error:', err);
		return null;
	}
}

/** Non-streaming fallback */
export async function generateAIResponse(message: string, context: AIContext): Promise<string> {
	try {
		const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${NVIDIA_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: MODEL,
				messages: buildMessages(message, buildContextString(context)),
				temperature: 0.7,
				top_p: 0.95,
				max_tokens: 1024,
				stream: false
			})
		});

		if (!response.ok) {
			console.error('NVIDIA API error:', response.status, await response.text().catch(() => ''));
			return fallbackResponse(message, context);
		}

		const data = await response.json();
		return data.choices?.[0]?.message?.content || fallbackResponse(message, context);
	} catch (err) {
		console.error('NVIDIA API fetch error:', err);
		return fallbackResponse(message, context);
	}
}

function fallbackResponse(message: string, context?: AIContext): string {
	const lowerMsg = message.toLowerCase();
	if (lowerMsg.includes('work on') || lowerMsg.includes('priority') || lowerMsg.includes('first')) {
		if (context && context.tasks.length > 0) {
			const highPriority = context.tasks.find((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH');
			if (highPriority)
				return `Based on your tasks, I recommend starting with **${highPriority.title}** as it's marked as high priority.\n\nWould you like help breaking it into smaller steps?`;
			return `You have ${context.tasks.length} pending tasks. I'd suggest starting with **${context.tasks[0].title}** to build momentum.`;
		}
		return "You don't have any pending tasks right now. Great job! Would you like to create some for tomorrow?";
	}
	if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
		const taskCount = context?.tasks.length || 0;
		const eventCount = context?.events.length || 0;
		return `Hey there! I'm your **FlowPlan AI** assistant.\n\nHere's your quick snapshot:\n- **${taskCount} active tasks** pending\n- **${eventCount} events** this week\n\nWhat would you like help with?`;
	}
	return `I'm here to help you stay productive! Ask me about your tasks, schedule conflicts, or how to plan your week.`;
}

/** Warm up the NVIDIA API endpoint to avoid cold starts */
export function warmupNvidia() {
	fetch(`${NVIDIA_API_BASE}/chat/completions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${NVIDIA_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [{ role: 'user', content: 'Ping' }],
			max_tokens: 1
		})
	}).catch(() => {});
}
