import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	let topTasks: any[] = [];
	try {
		// Fetch top tasks simply via Prisma (no drizzle)
		topTasks = await db.task.findMany({
			where: {
				userId: locals.user.id,
				status: { notIn: ['COMPLETED', 'ARCHIVED'] }
			},
			orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
			take: 3,
			select: {
				id: true,
				title: true,
				priority: true,
				category: true,
				dueDate: true
			}
		});
	} catch (e) {
		console.error('Focus: failed to load tasks:', e);
	}

	return { topTasks };
};
