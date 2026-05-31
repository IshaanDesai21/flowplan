import { db } from '$lib/server/db.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const tasks = await db.task.findMany({
		where: { userId },
		orderBy: [
			{ position: 'asc' },
			{ dueDate: 'asc' }
		]
	});

	return {
		tasks
	};
};
