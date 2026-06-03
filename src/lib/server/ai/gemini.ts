import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import type { AIContext } from './context.js';

const GEMINI_API_KEY = env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are FlowPlan AI, a highly intelligent productivity assistant powered by Gemini.
You have access to the user's tasks and calendar events.

TONE & FORMAT RULES — follow these strictly:
- Always respond in a formal, professional tone. No casual language, slang, or overly enthusiastic phrases.
- Always express times in 12-hour format with AM/PM (e.g. "9:00 AM", "2:30 PM", not "14:30" or "9h").
- Format responses in clean markdown: use **bold** for emphasis, bullet lists for multiple points, and headers for sections.
- Be concise and action-oriented. Prioritize what is most useful to the user.
- Do not hallucinate tasks or events that are not present in the context.
- When referring to deadlines or schedule items, always use 12-hour time and include the date.`;

function buildContextString(context: AIContext): string {
	return `
CURRENT TIME: ${context.today}
UPCOMING TASKS (${context.tasks.length} total): ${JSON.stringify(context.tasks.slice(0, 15), null, 2)}
UPCOMING EVENTS (NEXT 7 DAYS, ${context.events.length} total): ${JSON.stringify(context.events.slice(0, 10), null, 2)}
`;
}

/** Returns a streaming ReadableStream of text tokens from Gemini */
export async function generateAIStream(
	message: string,
	context: AIContext
): Promise<ReadableStream<Uint8Array> | null> {
	try {
		const model = genAI.getGenerativeModel({ 
			model: "gemini-1.5-pro",
			systemInstruction: SYSTEM_PROMPT
		});
		
		const prompt = `User Context:\n${buildContextString(context)}\n\nUser Message: ${message}`;
		const result = await model.generateContentStream(prompt);
		
		const encoder = new TextEncoder();
		
		return new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of result.stream) {
						const chunkText = chunk.text();
						controller.enqueue(encoder.encode(chunkText));
					}
				} catch (e) {
					console.error("Gemini stream chunk error", e);
				} finally {
					controller.close();
				}
			}
		});
	} catch (err) {
		console.error('Gemini streaming error:', err);
		return null;
	}
}

/** Non-streaming fallback */
export async function generateAIResponse(message: string, context: AIContext): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({ 
			model: "gemini-1.5-pro",
			systemInstruction: SYSTEM_PROMPT
		});
		
		const prompt = `User Context:\n${buildContextString(context)}\n\nUser Message: ${message}`;
		const result = await model.generateContent(prompt);
		
		return result.response.text();
	} catch (err) {
		console.error('Gemini API fetch error:', err);
		return fallbackResponse(message, err, context);
	}
}

function fallbackResponse(message: string, err: any, context?: AIContext): string {
	const lowerMsg = message.toLowerCase();
	
	const errStr = err instanceof Error ? err.message : String(err);
	const errPrefix = `*(Gemini API Error: ${errStr})*\n\n`;

	if (lowerMsg.includes('work on') || lowerMsg.includes('priority') || lowerMsg.includes('first')) {
		if (context && context.tasks.length > 0) {
			const highPriority = context.tasks.find((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH');
			if (highPriority)
				return `${errPrefix}I'd suggest starting with **${highPriority.title}** since it's high priority! Let me know if you want to break it down.`;
			return `${errPrefix}You've got ${context.tasks.length} tasks lined up. Let's start with **${context.tasks[0].title}** to get some momentum!`;
		}
		return `${errPrefix}You don't have any pending tasks right now. Ready to plan some for tomorrow?`;
	}
	if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
		const taskCount = context?.tasks.length || 0;
		const eventCount = context?.events.length || 0;
		return `${errPrefix}Hey there! I'm your **FlowPlan AI**.\n\nHere's a quick look at your plate:\n- **${taskCount} active tasks** pending\n- **${eventCount} events** scheduled this week\n\nWhat can I help you tackle today?`;
	}
	return `${errPrefix}I'm here to help you stay on top of things! Ask me about your schedule, tasks, or planning out your week.`;
}
