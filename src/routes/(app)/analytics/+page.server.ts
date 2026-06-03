import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;
	
	// Fetch last 60 days of activity
	const now = new Date();
	const startDate = startOfDay(subDays(now, 59));
	const endDate = endOfDay(now);

	const completedTasks = await db.task.findMany({
		where: {
			userId,
			status: 'COMPLETED',
			completedAt: {
				gte: startDate,
				lte: endDate
			}
		},
		select: {
			completedAt: true
		}
	});

	// Process into heatmap data
	const heatmapMap = new Map<string, number>();
	for (const task of completedTasks) {
		if (task.completedAt) {
			const dateStr = format(task.completedAt, 'yyyy-MM-dd');
			heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1);
		}
	}

	// Generate array of last 60 days
	const heatmapData = [];
	for (let i = 59; i >= 0; i--) {
		const date = subDays(now, i);
		const dateStr = format(date, 'yyyy-MM-dd');
		heatmapData.push({
			date: dateStr,
			count: heatmapMap.get(dateStr) || 0
		});
	}

	// Basic lifetime stats
	const totalCompleted = await db.task.count({
		where: { userId, status: 'COMPLETED' }
	});
	const totalCreated = await db.task.count({
		where: { userId }
	});

	return {
		heatmapData,
		stats: {
			totalCompleted,
			totalCreated,
			completionRate: totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0
		}
	};
};
