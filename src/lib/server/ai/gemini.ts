import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIContext } from './context.js';

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
	genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `You are FlowPlan AI, a highly intelligent and helpful productivity assistant.
You have access to the user's tasks and calendar events.
Your goal is to help them plan their day, prioritize work, find schedule conflicts, and stay productive.

Keep your responses concise, actionable, and formatted in clean markdown. Use bullet points and bold text for emphasis.
If they ask what to work on, look at their tasks (focus on CRITICAL/HIGH priority or due dates) and events.
Do not hallucinate tasks or events that are not in the context.`;

export async function generateAIResponse(message: string, context: AIContext): Promise<string> {
	const contextString = `
CURRENT TIME: ${context.today}
UPCOMING TASKS: ${JSON.stringify(context.tasks)}
UPCOMING EVENTS (NEXT 7 DAYS): ${JSON.stringify(context.events)}
`;

	if (genAI) {
		try {
			const model = genAI.getGenerativeModel({
				model: 'gemini-1.5-flash',
				systemInstruction: SYSTEM_PROMPT
			});

			const prompt = `Context data:\n${contextString}\n\nUser message: ${message}`;
			const result = await model.generateContent(prompt);
			const response = await result.response;
			return response.text();
		} catch (error) {
			console.error('Gemini API Error:', error);
			return fallbackResponse(message);
		}
	} else {
		// Mock response if no API key
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return fallbackResponse(message, context);
	}
}

function fallbackResponse(message: string, context?: AIContext): string {
	const lowerMsg = message.toLowerCase();
	
	if (lowerMsg.includes('work on') || lowerMsg.includes('priority') || lowerMsg.includes('first')) {
		if (context && context.tasks.length > 0) {
			const highPriority = context.tasks.find(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');
			if (highPriority) {
				return `Based on your tasks, I recommend starting with **${highPriority.title}** as it's marked as high priority.`;
			}
			return `You have ${context.tasks.length} pending tasks. I'd suggest starting with **${context.tasks[0].title}** to get some momentum.`;
		}
		return "You don't have any pending tasks right now. Great job! Would you like to create some?";
	}
	
	if (lowerMsg.includes('plan') || lowerMsg.includes('day')) {
		if (context && context.events.length > 0) {
			return `You have ${context.events.length} events scheduled soon. I recommend tackling your most complex tasks in the gaps between these meetings.`;
		}
		return "Your schedule looks clear today. This is a great opportunity to block out time for deep, focused work.";
	}

	return "**Demo Mode**: To unlock full AI capabilities, add a Gemini API key to the environment variables.\n\nFor now, I can tell you that you're doing great! Keep up the good work.";
}
