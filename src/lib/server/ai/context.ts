import { db } from '../db.js';
import { startOfDay, addDays } from 'date-fns';

export interface AIContext {
	today: string;
	tasks: any[];
	events: any[];
}

export async function buildUserContext(userId: string): Promise<AIContext> {
	const now = new Date();
	const todayStart = startOfDay(now);
	const nextWeekEnd = addDays(todayStart, 7);

	// Fetch upcoming tasks
	const tasks = await db.task.findMany({
		where: {
			userId,
			status: { notIn: ['COMPLETED', 'ARCHIVED'] }
		},
		select: {
			id: true,
			title: true,
			description: true,
			dueDate: true,
			priority: true,
			status: true
		},
		orderBy: { dueDate: 'asc' },
		take: 20
	});

	// Fetch upcoming events
	const events = await db.calendarEvent.findMany({
		where: {
			userId,
			startTime: { gte: todayStart, lte: nextWeekEnd }
		},
		select: {
			id: true,
			title: true,
			startTime: true,
			endTime: true,
			isTimeBlock: true
		},
		orderBy: { startTime: 'asc' }
	});

	return {
		today: now.toISOString(),
		tasks,
		events
	};
}
