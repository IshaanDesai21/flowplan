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

	let heatmapData: { date: string; count: number }[] = [];
	let totalCompleted = 0;
	let totalCreated = 0;

	try {
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
		for (let i = 59; i >= 0; i--) {
			const date = subDays(now, i);
			const dateStr = format(date, 'yyyy-MM-dd');
			heatmapData.push({
				date: dateStr,
				count: heatmapMap.get(dateStr) || 0
			});
		}

		// Basic lifetime stats
		totalCompleted = await db.task.count({
			where: { userId, status: 'COMPLETED' }
		});
		totalCreated = await db.task.count({
			where: { userId }
		});
	} catch (e) {
		console.error('Analytics: failed to load data:', e);
		// Generate empty heatmap for the 60 days
		for (let i = 59; i >= 0; i--) {
			const date = subDays(now, i);
			const dateStr = format(date, 'yyyy-MM-dd');
			heatmapData.push({ date: dateStr, count: 0 });
		}
	}

	return {
		heatmapData,
		stats: {
			totalCompleted,
			totalCreated,
			completionRate: totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0
		}
	};
};
