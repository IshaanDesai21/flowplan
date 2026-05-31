import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const status = url.searchParams.get('status');
	const priority = url.searchParams.get('priority');
	const category = url.searchParams.get('category');

	const where: Record<string, unknown> = { userId: locals.user.id };
	if (status) where.status = status;
	if (priority) where.priority = priority;
	if (category) where.category = category;

	const tasks = await db.task.findMany({
		where,
		orderBy: [{ position: 'asc' }, { createdAt: 'desc' }]
	});

	return json(tasks);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const task = await db.task.create({
		data: {
			userId: locals.user.id,
			title: data.title,
			description: data.description || null,
			dueDate: data.dueDate ? new Date(data.dueDate) : null,
			dueTime: data.dueTime || null,
			priority: data.priority || 'MEDIUM',
			category: data.category || null,
			status: data.status || 'NOT_STARTED',
			estimatedDuration: data.estimatedDuration || null,
			notes: data.notes || null,
			position: data.position || 0
		}
	});

	return json(task, { status: 201 });
};
