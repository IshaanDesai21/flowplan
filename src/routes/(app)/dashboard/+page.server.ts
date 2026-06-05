import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { generateAIResponse } from '$lib/server/ai/nvidia.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;
	const now = new Date();
	const todayStart = startOfDay(now);
	const todayEnd = endOfDay(now);
	const tomorrowStart = startOfDay(addDays(now, 1));
	const weekStart = startOfWeek(now);
	const weekEnd = endOfWeek(now);

	let todayTasks: any[] = [];
	let upcomingTasks: any[] = [];
	let todayEvents: any[] = [];
	let completedTasksThisWeek = 0;
	let totalTasksThisWeek = 0;
	let recentAiConversation = null;

	try {
		// Fetch today's tasks
		todayTasks = await db.task.findMany({
			where: {
				userId,
				dueDate: {
					gte: todayStart,
					lte: todayEnd
				},
				status: {
					not: 'COMPLETED'
				}
			},
			orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }]
		});

		// Fetch upcoming tasks (next 7 days)
		upcomingTasks = await db.task.findMany({
			where: {
				userId,
				dueDate: {
					gte: tomorrowStart,
					lte: addDays(todayEnd, 7)
				},
				status: {
					not: 'COMPLETED'
				}
			},
			orderBy: { dueDate: 'asc' },
			take: 5
		});

		// Fetch today's events
		todayEvents = await db.calendarEvent.findMany({
			where: {
				userId,
				startTime: {
					gte: todayStart,
					lte: todayEnd
				}
			},
			orderBy: { startTime: 'asc' }
		});

		// Fetch stats for this week
		completedTasksThisWeek = await db.task.count({
			where: {
				userId,
				status: 'COMPLETED',
				completedAt: {
					gte: weekStart,
					lte: weekEnd
				}
			}
		});

		totalTasksThisWeek = await db.task.count({
			where: {
				userId,
				createdAt: {
					gte: weekStart,
					lte: weekEnd
				}
			}
		});

		// Get latest AI conversation for quick access
		recentAiConversation = await db.aIConversation.findFirst({
			where: { userId },
			orderBy: { updatedAt: 'desc' },
			take: 1
		});
	} catch (e) {
		console.error('Dashboard: failed to load data:', e);
	}

	// Generate NVIDIA-powered AI Summary based on actual task names/events
	const firstName = locals.user.name.split(' ')[0];
	const hour = now.getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	const dateStr = format(now, 'EEEE, MMMM do');

	const getAiSummary = async () => {
		try {
			const taskContext = todayTasks.length > 0
				? todayTasks.slice(0, 5).map(t => `- "${t.title}" (${t.priority} priority${t.dueDate ? '' : ''})`).join('\n')
				: 'No tasks due today';

			const eventContext = todayEvents.length > 0
				? todayEvents.slice(0, 3).map(e => `- "${e.title}"`).join('\n')
				: 'No events today';

			const prompt = `It's ${dateStr}. ${greeting} ${firstName}. 

Their tasks today:
${taskContext}

Their events today:
${eventContext}

Write ONE short, friendly sentence (max 25 words) summarizing their day and what they should prioritize. Be specific about their actual tasks by name. No bullet points. Just one punchy sentence.`;

			return await generateAIResponse(prompt, {
				today: now.toISOString(),
				tasks: todayTasks.map(t => ({ title: t.title, priority: t.priority, status: t.status })),
				events: todayEvents.map(e => ({ title: e.title, startTime: e.startTime?.toISOString() }))
			});
		} catch {
			// Fallback to local summary if NVIDIA fails
			const highPriority = todayTasks.find(t => t.priority === 'HIGH' || t.priority === 'CRITICAL');
			if (highPriority) {
				return `${greeting} ${firstName} — start strong with "${highPriority.title}" today.`;
			} else if (todayTasks.length === 0 && todayEvents.length === 0) {
				return `${greeting} ${firstName}, your day is clear — a great time to get ahead!`;
			} else if (todayTasks.length > 0) {
				return `${greeting} ${firstName} — tackle "${todayTasks[0].title}" first to build momentum.`;
			} else {
				return `${greeting} ${firstName}, you have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} on the calendar today.`;
			}
		}
	};

	return {
		todayTasks,
		upcomingTasks,
		todayEvents,
		stats: {
			completedTasksThisWeek,
			totalTasksThisWeek,
			productivityScore: totalTasksThisWeek > 0 ? Math.round((completedTasksThisWeek / totalTasksThisWeek) * 100) : 0
		},
		recentAiConversation,
		streamed: {
			aiSummary: getAiSummary()
		}
	};
};
