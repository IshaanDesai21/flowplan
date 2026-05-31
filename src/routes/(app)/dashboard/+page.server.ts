import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';

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

	// Fetch today's tasks
	const todayTasks = await db.task.findMany({
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
	const upcomingTasks = await db.task.findMany({
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
	const todayEvents = await db.calendarEvent.findMany({
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
	const completedTasksThisWeek = await db.task.count({
		where: {
			userId,
			status: 'COMPLETED',
			completedAt: {
				gte: weekStart,
				lte: weekEnd
			}
		}
	});

	const totalTasksThisWeek = await db.task.count({
		where: {
			userId,
			createdAt: {
				gte: weekStart,
				lte: weekEnd
			}
		}
	});

	// Get latest AI conversation for quick access
	const recentAiConversation = await db.aIConversation.findFirst({
		where: { userId },
		orderBy: { updatedAt: 'desc' },
		take: 1
	});

	return {
		todayTasks,
		upcomingTasks,
		todayEvents,
		stats: {
			completedTasksThisWeek,
			totalTasksThisWeek,
			productivityScore: totalTasksThisWeek > 0 ? Math.round((completedTasksThisWeek / totalTasksThisWeek) * 100) : 0
		},
		recentAiConversation
	};
};
