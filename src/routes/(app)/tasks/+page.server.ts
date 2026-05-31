import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const tasks = await db.task.findMany({
		where: { userId: locals.user.id },
		orderBy: [{ position: 'asc' }, { createdAt: 'desc' }]
	});

	// Serialize dates for SvelteKit transfer
	const serializedTasks = tasks.map(t => ({
		...t,
		dueDate: t.dueDate ? t.dueDate.toISOString() : null,
		createdAt: t.createdAt.toISOString(),
		updatedAt: t.updatedAt.toISOString(),
		completedAt: t.completedAt ? t.completedAt.toISOString() : null
	}));

	return { tasks: serializedTasks };
};
