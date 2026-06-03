import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const [tasks, checklists] = await Promise.all([
		db.task.findMany({
			where: { userId },
			orderBy: [{ position: 'asc' }, { createdAt: 'desc' }]
		}),
		db.checklist.findMany({
			where: { userId },
			include: { items: { orderBy: { position: 'asc' } } },
			orderBy: { createdAt: 'asc' }
		})
	]);

	const serializedTasks = tasks.map((t) => ({
		...t,
		dueDate: t.dueDate ? t.dueDate.toISOString() : null,
		createdAt: t.createdAt.toISOString(),
		updatedAt: t.updatedAt.toISOString(),
		completedAt: t.completedAt ? t.completedAt.toISOString() : null
	}));

	const serializedChecklists = checklists.map((c) => ({
		...c,
		dueDate: c.dueDate ? c.dueDate.toISOString() : null,
		createdAt: c.createdAt.toISOString(),
		updatedAt: c.updatedAt.toISOString(),
		items: c.items.map((i) => ({
			...i,
			createdAt: i.createdAt.toISOString(),
			updatedAt: i.updatedAt.toISOString()
		}))
	}));

	return { tasks: serializedTasks, checklists: serializedChecklists };
};
